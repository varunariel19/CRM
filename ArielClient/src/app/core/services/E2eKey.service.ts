import { Injectable } from '@angular/core';

export interface SignupKeyMaterial {
    publicKeyBase64: string;
    encryptedPrivateKeyBase64: string;
    saltBase64: string;
}

@Injectable({ providedIn: 'root' })
export class E2eKeyService {
    private readonly PBKDF2_ITERATIONS = 210_000;
    private readonly SALT_LENGTH = 16;
    private readonly NONCE_LENGTH = 12;

    private readonly DB_NAME = 'e2e-key-store';
    private readonly STORE_NAME = 'private-keys';
    private readonly DB_VERSION = 1;

    private privateKey: CryptoKey | null = null;
    private dbPromise: Promise<IDBDatabase> | null = null;

    async generateAndEncryptKeyPair(password: string, userId: string): Promise<SignupKeyMaterial> {
        
        const keyPair = await crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256',
            },
            true,
            ['encrypt', 'decrypt']
        );

        const publicKeyBytes = await crypto.subtle.exportKey('spki', keyPair.publicKey);
        const privateKeyBytes = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

        const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
        const derivedKey = await this.deriveKeyFromPassword(password, salt);

        const nonce = crypto.getRandomValues(new Uint8Array(this.NONCE_LENGTH));
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: nonce as BufferSource },
            derivedKey,
            privateKeyBytes
        );

        const packed = this.concatBuffers(nonce, new Uint8Array(ciphertext));

        this.privateKey = keyPair.privateKey;

        await this.savePrivateKeyToIndexedDb(userId, keyPair.privateKey);

        return {
            publicKeyBase64: this.arrayBufferToBase64(publicKeyBytes),
            encryptedPrivateKeyBase64: this.arrayBufferToBase64(packed),
            saltBase64: this.arrayBufferToBase64(salt),
        };
    }

    async decryptPrivateKey(
        password: string,
        encryptedPrivateKeyBase64: string,
        saltBase64: string,
        userId: string
    ): Promise<void> {
        const salt = this.base64ToArrayBuffer(saltBase64);
        const packed = this.base64ToArrayBuffer(encryptedPrivateKeyBase64);

        const nonce = packed.slice(0, this.NONCE_LENGTH);
        const ciphertext = packed.slice(this.NONCE_LENGTH);

        const derivedKey = await this.deriveKeyFromPassword(password, new Uint8Array(salt));

        const privateKeyBytes = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: nonce as BufferSource },
            derivedKey,
            ciphertext as BufferSource
        );

        this.privateKey = await crypto.subtle.importKey(
            'pkcs8',
            privateKeyBytes,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            true,
            ['decrypt']
        );

        await this.savePrivateKeyToIndexedDb(userId, this.privateKey);
    }


    async tryRestoreFromIndexedDb(userId: string): Promise<boolean> {
        const key = await this.loadPrivateKeyFromIndexedDb(userId);
        if (key) {
            this.privateKey = key;
            return true;
        }
        return false;
    }

    getPrivateKey(): CryptoKey | null {
        return this.privateKey;
    }

    async clearPrivateKey(userId: string): Promise<void> {
        this.privateKey = null;
        await this.clearPrivateKeyFromIndexedDb(userId);
    }


    private openDb(): Promise<IDBDatabase> {
        if (this.dbPromise) return this.dbPromise;

        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME);
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        return this.dbPromise;
    }

    private async savePrivateKeyToIndexedDb(userId: string, key: CryptoKey): Promise<void> {
        const db = await this.openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, 'readwrite');
            tx.objectStore(this.STORE_NAME).put(key, userId);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    private async loadPrivateKeyFromIndexedDb(userId: string): Promise<CryptoKey | null> {
        const db = await this.openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, 'readonly');
            const request = tx.objectStore(this.STORE_NAME).get(userId);
            request.onsuccess = () => resolve((request.result as CryptoKey) ?? null);
            request.onerror = () => reject(request.error);
        });
    }

    private async clearPrivateKeyFromIndexedDb(userId: string): Promise<void> {
        const db = await this.openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, 'readwrite');
            tx.objectStore(this.STORE_NAME).delete(userId);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }


    private async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt as BufferSource,
                iterations: this.PBKDF2_ITERATIONS,
                hash: 'SHA-256',
            },
            passwordKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    private concatBuffers(a: Uint8Array, b: Uint8Array): Uint8Array {
        const result = new Uint8Array(a.length + b.length);
        result.set(a, 0);
        result.set(b, a.length);
        return result;
    }

    private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
        const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        let binary = '';
        for (const byte of bytes) binary += String.fromCharCode(byte);
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): Uint8Array {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }
}