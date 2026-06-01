import { Injectable, signal, computed } from '@angular/core';
import { Contact } from '../core/types/contact.type';
import { NoteDto } from '../services/notes.service';


@Injectable({ providedIn: 'root' })
export class ContactState {
    private _contacts = signal<Contact[]>([]);
    private _selectedContact = signal<Contact | null>(null);
    private _notes = signal<NoteDto[]>([]);

    // Public read-only
    contacts = computed(() => this._contacts());
    notes = computed(() => this._notes());

    selectedContact = computed(() => this._selectedContact());

    totalContacts = computed(() => this._contacts().length);
    hasContacts = computed(() => this._contacts().length > 0);

    setContacts(contacts: Contact[]): void {
        this._contacts.set(contacts);
    }

    setNotes(notes: NoteDto[]): void {
        this._notes.set(notes);
    }

    addNote(note: NoteDto): void {
        this._notes.update(notes => [...notes, note]);
    }

    updateNote(id: string, updated: NoteDto): void {
        this._notes.update(notes =>
            notes.map(n => n.id === id ? updated : n)
        );
    }

    removeNote(id: string): void {
        this._notes.update(notes => notes.filter(n => n.id !== id));
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


    clear(): void {
        this._contacts.set([]);
        this._selectedContact.set(null);
    }
}