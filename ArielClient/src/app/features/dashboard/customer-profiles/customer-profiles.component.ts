import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, effect, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Contact, CreateContactPayload, UpdateContactPayload } from '../../../core/types/contact.type';
import { ContactService } from '../../../services/contact.service';
import { ContactState } from '../../../state/contact.state';
import { AuthState } from '../../../state/auth.state';
import { NoteService, NoteDto, CreateNoteRequest } from '../../../services/notes.service';
import { PermissionFacade } from '../../../core/services/permissionFacade.service';
import { UserProfileComponent } from '../../../components/items/user-profile/user-profile.component';

@Component({
  selector: 'app-customer-profiles',
  standalone: true,
  imports: [CommonModule, FormsModule , UserProfileComponent],
  templateUrl: './customer-profiles.component.html',
  styleUrl: './customer-profiles.component.scss',
})
export class CustomerProfilesComponent {
  @ViewChild('notesBox') notesBox!: ElementRef;

  contactState = inject(ContactState);
  authState = inject(AuthState);
  perm = inject(PermissionFacade);

  noteService = inject(NoteService);

  searchText = '';
  newNote = '';
  showCreateModal = false;
  showEditModal = false;
  isNotesLoading = false;

  newClient: CreateContactPayload = this.resetCreateForm();
  editClient: Contact = {} as Contact;

  editingNote: NoteDto | null = null;
  editingText = '';

  constructor(private contactService: ContactService) {
    effect(() => {
      const contact = this.contactState.selectedContact();
      this.contactState.setNotes([]);

      if (!contact?.id) return;

      this.isNotesLoading = true;
      this.noteService.getNotes('Contact', contact.id).subscribe({
        next: (notes) => {
          this.contactState.setNotes(notes);
          this.isNotesLoading = false;
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('Failed to load notes', err);
          this.isNotesLoading = false;
        },
      });
    });
  }

  get currentUserName(): string { return this.authState.user()?.name ?? ''; }
  get clients(): Contact[] { return this.contactState.contacts(); }
  get selectedClient(): Contact | null { return this.contactState.selectedContact(); }
  get notes(): NoteDto[] { return this.contactState.notes() };


  // client operation 
  saveEdit(): void {
    if (!this.editClient.id) return;

    const payload: UpdateContactPayload = {
      name: this.editClient.name,
      company: this.editClient.company,
      designation: this.editClient.designation || 'Staff',
      email: this.editClient.email,
      phone: this.editClient.phone,
      address: this.editClient.address,
    };

    this.contactService.updateContact(this.editClient.id, payload).subscribe({
      next: () => {
        this.contactState.updateContact(this.editClient.id, payload);
        const updated = this.clients.find(c => c.id === this.editClient.id);
        if (updated) this.contactState.selectContact(updated);
        this.showEditModal = false;
      },
      error: (err) => console.error('Failed to update contact', err),
    });
  }

  deleteClient(id: string): void {
    if (!confirm('Are you sure you want to permanently delete this corporate profile?')) return;

    this.contactService.deleteContact(id).subscribe({
      next: () => {
        this.contactState.removeContact(id);
        this.contactState.selectContact(this.clients.length ? this.clients[0] : null);
      },
      error: (err) => console.error('Failed to delete contact', err),
    });
  }

  saveNewContact(): void {
    if (!this.newClient.name || !this.newClient.company || !this.newClient.email) {
      alert('Please fill out all required fields.');
      return;
    }

    this.contactService.createContact(this.newClient).subscribe({
      next: (created) => {
        this.contactState.addContact(created);
        this.contactState.selectContact(created);
        this.showCreateModal = false;
        this.newClient = this.resetCreateForm();
      },
      error: (err) => console.error('Failed to create contact', err),
    });
  }


  // notes operation 
  addNote(): void {
    const content = this.newNote.trim();
    if (!content || !this.selectedClient || !this.authState.userId() || !this.currentUserName) return;
    const createdNote: CreateNoteRequest = {
      content,
      relatedTo: 'Contact',
      relatedId: this.selectedClient.id,
      createdByName: this.currentUserName,
      createdById: this.authState.userId()!
    }
    this.noteService.createNote(createdNote).subscribe({
      next: (created) => {
        this.contactState.addNote(created);
        this.newNote = '';
        this.scrollToBottom();
      },
      error: (err) => console.error('Failed to add note', err),
    });
  }

  saveEditNote(note: NoteDto): void {
    const content = this.editingText.trim();
    if (!content) return;

    this.noteService.updateNote(note.id, { content }).subscribe({
      next: (updated) => {
        this.contactState.updateNote(note.id, updated);
        this.cancelEdit();
      },
      error: (err) => console.error('Failed to update note', err),
    });
  }

  deleteNote(note: NoteDto): void {
    this.noteService.deleteNote(note.id).subscribe({
      next: () => {
        this.contactState.removeNote(note.id);
      },
      error: (err) => console.error('Failed to delete note', err),
    });
  }

  startEdit(note: NoteDto): void {
    this.editingNote = note;
    this.editingText = note.content;
  }




  cancelEdit(): void {
    this.editingNote = null;
    this.editingText = '';
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.notesBox) {
        this.notesBox.nativeElement.scrollTop = this.notesBox.nativeElement.scrollHeight;
      }
    }, 50);
  }

  filteredClients(): Contact[] {
    const q = this.searchText.toLowerCase();
    return this.clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q)
    );
  }

  selectClient(client: Contact): void {
    this.contactState.selectContact(client);
  }

  openEditModal(): void {
    if (!this.selectedClient) return;
    this.editClient = { ...this.selectedClient };
    this.showEditModal = true;
  }

  private resetCreateForm(): CreateContactPayload {
    return { name: '', company: '', designation: 'Staff', email: '', phone: '', address: '' };
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
}