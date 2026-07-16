import { Injectable, inject } from '@angular/core';
import { E2eKeyService } from './E2eKey.service';

export interface EncryptedMessagePayload {
  encryptedAesKeyBase64: string;
  ivBase64: string;             
  ciphertextBase64: string;   
}

export interface RecipientPublicKey {
  recipientId: string;
  publicKeyBase64: string;
}

export interface EncryptedTeamMessagePayload {
  body: string;
  iv: string;
  recipientKeys: Array<{
    recipientId: string;
    encryptedAesKey: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class MessageCryptoService {
  private e2eKeyService = inject(E2eKeyService);

  private readonly IV_LENGTH = 12; 

  async encryptForRecipients(plaintext: string, recipients: RecipientPublicKey[]): Promise<EncryptedTeamMessagePayload> {
    if (!recipients.length) {
      throw new Error('At least one recipient public key is required.');
    }

    const aesKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const messageBytes = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      aesKey,
      messageBytes
    );

    const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
    const recipientKeys = await Promise.all(recipients.map(async recipient => {
      const publicKey = await this.importPublicKey(recipient.publicKeyBase64);
      const encryptedAesKey = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        rawAesKey
      );

      return {
        recipientId: recipient.recipientId,
        encryptedAesKey: this.arrayBufferToBase64(encryptedAesKey),
      };
    }));

    return {
      body: this.arrayBufferToBase64(ciphertext),
      iv: this.arrayBufferToBase64(iv),
      recipientKeys,
    };
  }

  async encryptMessage(plaintext: string, recipientPublicKeyBase64: string): Promise<EncryptedMessagePayload> {
    const recipientPublicKey = await this.importPublicKey(recipientPublicKeyBase64);

    const aesKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const messageBytes = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      aesKey,
      messageBytes
    );

    const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
    const encryptedAesKey = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      recipientPublicKey,
      rawAesKey
    );

    return {
      encryptedAesKeyBase64: this.arrayBufferToBase64(encryptedAesKey),
      ivBase64: this.arrayBufferToBase64(iv),
      ciphertextBase64: this.arrayBufferToBase64(ciphertext),
    };
  }

  async decryptMessage(payload: EncryptedMessagePayload): Promise<string> {
    const privateKey = this.e2eKeyService.getPrivateKey();
    if (!privateKey) {
      throw new Error('Private key not unlocked. Cannot decrypt message.');
    }

    const encryptedAesKey = this.base64ToArrayBuffer(payload.encryptedAesKeyBase64);
    const rawAesKey = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedAesKey as BufferSource
    );

    const aesKey = await crypto.subtle.importKey(
      'raw',
      rawAesKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const iv = this.base64ToArrayBuffer(payload.ivBase64);
    const ciphertext = this.base64ToArrayBuffer(payload.ciphertextBase64);

    const plaintextBytes = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      aesKey,
      ciphertext as BufferSource
    );

    return new TextDecoder().decode(plaintextBytes);
  }


  private async importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
    const keyBytes = this.base64ToArrayBuffer(publicKeyBase64);
    return crypto.subtle.importKey(
      'spki',
      keyBytes as BufferSource,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    );
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
