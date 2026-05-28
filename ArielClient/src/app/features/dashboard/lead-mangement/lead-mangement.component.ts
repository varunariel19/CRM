
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
@Component({
  selector: 'app-lead-mangement',
  imports: [CommonModule],

  templateUrl: './lead-mangement.component.html',
  styleUrl: './lead-mangement.component.css',
})

export class LeadManagementComponent {

  leads = [
    {
      name: 'John Doe',
      company: 'Acme Corp',
      email: 'john@acme.com',
      phone: '+1 555 123 4567',
      source: 'Referral',
      status: 'New',
      date: '5/23/2026',
    },
    {
      name: 'Alice Smith',
      company: 'Vertex Solutions',
      email: 'alice@vertex.io',
      phone: '+1 555 987 6543',
      source: 'Website',
      status: 'Contacted',
      date: '5/24/2026',
    },
    {
      name: 'Bob Johnson',
      company: 'Nexus Tech',
      email: 'bob@nexus.com',
      phone: '+1 555 456 7890',
      source: 'Referral',
      status: 'Qualified',
      date: '5/25/2026',
    },
    {
      name: 'Carol Williams',
      company: 'Hyperion Labs',
      email: 'carol@hyperion.com',
      phone: '+1 555 222 3333',
      source: 'Email Campaign',
      status: 'Converted',
      date: '5/26/2026',
    },
    {
      name: 'David Brown',
      company: 'Initech Inc',
      email: 'david@initech.com',
      phone: '+1 555 444 5555',
      source: 'LinkedIn',
      status: 'Lost',
      date: '5/27/2026',
    },
  ];

}
