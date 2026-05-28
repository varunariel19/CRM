import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


export interface SupportTicket {
  id: number;
  ticketCode: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  requester: {
    name: string;
    company: string;
    email: string;
  };
  engineer: string;
}


@Component({
  selector: 'app-customer-tickets',
  imports: [CommonModule, FormsModule],

  templateUrl: './customer-tickets.component.html',
  styleUrl: './customer-tickets.component.css',
})

export class CustomerTicketsComponent {

  searchText = '';
  selectedStatus = 'All Statuses';
  selectedPriority = 'All Priorities';

  statusOptions = ['All Statuses', 'Open', 'In Progress', 'Resolved', 'Closed'];
  priorityOptions = ['All Priorities', 'Low', 'Medium', 'High', 'Critical'];

  engineerOptions = ['Emily Watson', 'Sarah Miller', 'David Carter', 'John Reed'];

  tickets: SupportTicket[] = [
    {
      id: 1,
      ticketCode: 'TK-2',
      priority: 'Medium',
      title: 'SSO Integration Request',
      description: 'Client wants to explore Auth0 SSO setup for their external customer hub.',
      status: 'Open',
      requester: {
        name: 'Carol Williams',
        company: 'Hyperion Labs',
        email: 'carol@hyperion.com',
      },
      engineer: 'Emily Watson',
    },
    {
      id: 2,
      ticketCode: 'TK-3',
      priority: 'Low',
      title: 'Billing Discrepancy SLA',
      description: 'SLA Invoice lists extra developer hours that need to be refunded.',
      status: 'In Progress',
      requester: {
        name: 'Alice Smith',
        company: 'Vertex Solutions',
        email: 'alice@vertex.io',
      },
      engineer: 'Sarah Miller',
    },
    {
      id: 3,
      ticketCode: 'TK-4',
      priority: 'High',
      title: 'API Rate Limit Issue',
      description: 'Production API returning 429 errors during peak business hours.',
      status: 'Open',
      requester: {
        name: 'Mark Johnson',
        company: 'DataSync Inc',
        email: 'mark@datasync.io',
      },
      engineer: 'David Carter',
    },
    {
      id: 4,
      ticketCode: 'TK-5',
      priority: 'Critical',
      title: 'Dashboard Not Loading',
      description: 'Enterprise dashboard fails to load for all users after last deployment.',
      status: 'In Progress',
      requester: {
        name: 'Nina Patel',
        company: 'FinEdge Corp',
        email: 'nina@finedge.com',
      },
      engineer: 'John Reed',
    },
  ];

  get filteredTickets(): SupportTicket[] {
    return this.tickets.filter((t) => {
      const matchSearch =
        !this.searchText ||
        t.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        t.description.toLowerCase().includes(this.searchText.toLowerCase()) ||
        t.requester.name.toLowerCase().includes(this.searchText.toLowerCase());

      const matchStatus =
        this.selectedStatus === 'All Statuses' || t.status === this.selectedStatus;

      const matchPriority =
        this.selectedPriority === 'All Priorities' || t.priority === this.selectedPriority;

      return matchSearch && matchStatus && matchPriority;
    });
  }

  deleteTicket(id: number): void {
    this.tickets = this.tickets.filter((t) => t.id !== id);
  }

  changeStatus(ticket: SupportTicket, event: Event): void {
    const select = event.target as HTMLSelectElement;
    ticket.status = select.value as SupportTicket['status'];
  }

  changeEngineer(ticket: SupportTicket, event: Event): void {
    const select = event.target as HTMLSelectElement;
    ticket.engineer = select.value;
  }

  raiseTicket(): void {
    const title = prompt('Enter ticket title:');
    if (!title) return;

    const description = prompt('Enter description:') || 'No description provided.';

    const newCode = `TK-${this.tickets.length + 2}`;

    this.tickets.unshift({
      id: Date.now(),
      ticketCode: newCode,
      priority: 'Medium',
      title,
      description,
      status: 'Open',
      requester: {
        name: 'New Requester',
        company: 'Unknown Co.',
        email: 'requester@example.com',
      },
      engineer: 'Emily Watson',
    });
  }

  getPriorityClass(priority: string): string {
    return priority.toLowerCase();
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }
}