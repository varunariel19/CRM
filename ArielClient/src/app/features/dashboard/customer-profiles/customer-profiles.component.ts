import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ClientNote {
  author: string;
  message: string;
  time: string;
}

interface Client {
  id: number;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes: ClientNote[];
}

@Component({
  selector: 'app-customer-profiles',
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-profiles.component.html',
  styleUrl: './customer-profiles.component.css',
})

export class CustomerProfilesComponent {

  searchText = '';
  newNote = '';
  editMode = false;

  clients = [
    {
      id: 1,
      name: 'John Doe',
      role: 'CTO',
      company: 'Acme Corp',
      email: 'john@acme.com',
      phone: '+1 555 123 4567',
      address: '123 Enterprise Way, Tech City, CA 94016',
      notes: [],
    },
    {
      id: 2,
      name: 'Alice Smith',
      role: 'IT Director',
      company: 'Vertex Solutions',
      email: 'alice@vertex.io',
      phone: '+1 555 987 6543',
      address: '55 Silicon Avenue, Austin, TX',
      notes: [],
    },
    {
      id: 3,
      name: 'Bob Johnson',
      role: 'Engineering Lead',
      company: 'Nexus Tech',
      email: 'bob@nexus.com',
      phone: '+1 555 456 7890',
      address: '900 Innovation Street, Seattle, WA',
      notes: [],
    },
    {
      id: 4,
      name: 'Carol Williams',
      role: 'CEO',
      company: 'Hyperion Labs',
      email: 'carol@hyperion.com',
      phone: '+1 555 222 3333',
      address: '12 Market Street, New York, NY',
      notes: [],
    },
  ];

  selectedClient: Client = this.clients[0];

  filteredClients() {
    return this.clients.filter((client) =>
      client.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      client.company.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  selectClient(client: any) {
    this.selectedClient = client;
  }

  addClient() {

    const id = this.clients.length + 1;

    const newClient = {
      id,
      name: `New Client ${id}`,
      role: 'Manager',
      company: 'New Company',
      email: `client${id}@mail.com`,
      phone: '+1 555 000 0000',
      address: 'Unknown Address',
      notes: [],
    };

    this.clients.unshift(newClient);
    this.selectedClient = newClient;
  }

  deleteClient(id: number) {

    this.clients = this.clients.filter((c) => c.id !== id);

    if (this.clients.length) {
      this.selectedClient = this.clients[0];
    }

  }

  toggleEditMode() {

    this.editMode = !this.editMode;

    if (this.editMode) {

      const name = prompt('Edit client name', this.selectedClient.name);

      if (name) {
        this.selectedClient.name = name;
      }

    }

  }

  addNote() {

    if (!this.newNote.trim()) return;

    this.selectedClient.notes.unshift({
      author: 'David Carter',
      message: this.newNote,
      time: new Date().toLocaleTimeString(),
    });

    this.newNote = '';
  }

}