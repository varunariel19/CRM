import { Injectable, signal, computed } from '@angular/core';
import { Contact } from '../core/types/contact.type';

@Injectable({ providedIn: 'root' })
export class ContactState {
    private _contacts = signal<Contact[]>([]);
    private _isLoading = signal(false);
    private _selectedContact = signal<Contact | null>(null);

    // Public read-only
    contacts = computed(() => this._contacts());
    selectedContact = computed(() => this._selectedContact());

    totalContacts = computed(() => this._contacts().length);
    hasContacts = computed(() => this._contacts().length > 0);

    setContacts(contacts: Contact[]): void {
        this._contacts.set(contacts);
    }

    addContact(contact: Contact): void {
        this._contacts.update(contacts => [contact, ...contacts]);
    }

    removeContact(id: string): void {
        this._contacts.update(contacts =>
            contacts.filter(c => c.id !== id)
        );
    }

    updateContact(id: string, updated: Partial<Contact>): void {
        this._contacts.update(contacts =>
            contacts.map(contact =>
                contact.id === id
                    ? { ...contact, ...updated }
                    : contact
            )
        );
    }

    selectContact(contact: Contact | null): void {
        this._selectedContact.set(contact);
    }

    setLoading(loading: boolean): void {
        this._isLoading.set(loading);
    }

    clear(): void {
        this._contacts.set([]);
        this._selectedContact.set(null);
    }
}