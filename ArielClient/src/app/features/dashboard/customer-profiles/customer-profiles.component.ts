import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Contact, CreateContactPayload, UpdateContactPayload } from '../../../core/types/contact.type';
import { ContactService } from '../../../services/contact.service';
import { ContactState } from '../../../state/contact.state';

@Component({
  selector: 'app-customer-profiles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-profiles.component.html',
  styleUrl: './customer-profiles.component.css',
})
export class CustomerProfilesComponent {

  contactState = inject(ContactState);

  searchText = '';
  newNote = '';

  showCreateModal = false;
  showEditModal = false;


  newClient: CreateContactPayload = this.resetCreateForm();

  editClient: Contact = {} as Contact;

  constructor(private contactService: ContactService) { }

  get clients(): Contact[] {
    return this.contactState.contacts();
  }

  get selectedClient(): Contact | null {
    return this.contactState.selectedContact();
  }


  private resetCreateForm(): CreateContactPayload {
    return {
      name: '',
      company: '',
      designation: 'Staff',
      email: '',
      phone: '',
      address: ''
    };
  }


  saveNewContact(): void {
    if (!this.newClient.name || !this.newClient.company || !this.newClient.email) {
      alert('Please fill out all required fields.');
      return;
    }

    this.contactService.createContact(this.newClient).subscribe({
      next: (created) => {
        const safeContact: any = { ...created, notes: [] };
        this.clients.push(safeContact);
        this.contactState.selectContact(safeContact);
        this.showCreateModal = false;
        this.newClient = this.resetCreateForm();
      },
      error: (err) => console.error('Failed to create new contact profile', err)
    });
  }

  openEditModal(): void {
    if (!this.selectedClient) return;
    this.editClient = { ...this.selectedClient };
    this.showEditModal = true;
  }

  saveEdit(): void {
    if (!this.editClient.id) return;

    const payload: UpdateContactPayload = {
      name: this.editClient.name,
      company: this.editClient.company,
      designation: this.editClient.designation || 'Staff',
      email: this.editClient.email,
      phone: this.editClient.phone,
      address: this.editClient.address
    };

    this.contactService.updateContact(this.editClient.id, payload).subscribe({
      next: () => {
        this.contactState.updateContact(this.editClient.id, payload);
        const updatedContact = this.clients.find(client => client.id == this.editClient.id);
        if (updatedContact) this.contactState.selectContact(updatedContact);

        this.showEditModal = false;
      },
      error: (err) => console.error('Failed to update corporate profile', err)
    });
  }

  deleteClient(id: string): void {
    if (!confirm('Are you sure you want to permanently delete this corporate profile?')) return;

    this.contactService.deleteContact(id).subscribe({
      next: () => {
        this.contactState.removeContact(id);
        this.contactState.selectContact(this.clients.length ? this.clients[0] : null);
      },
      error: (err) => console.error('Failed to delete the selected contact reference', err)
    });
  }

  closeModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showCreateModal = false;
    }
  }

  closeEditModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showEditModal = false;
    }
  }

  filteredClients(): Contact[] {
    return this.clients.filter((client) =>
      client.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      client.company.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  selectClient(client: Contact): void {
    this.contactState.selectContact(client);
  }

  addNote(): void {
    if (!this.newNote.trim() || !this.selectedClient) return;

    const clientWithNotes = this.selectedClient as any;
    if (!clientWithNotes.notes) clientWithNotes.notes = [];

    clientWithNotes.notes.unshift({
      author: 'David Carter',
      message: this.newNote,
      time: new Date().toLocaleTimeString(),
    });

    this.newNote = '';
  }
}