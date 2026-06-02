import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactState } from '../../../state/contact.state';
import { AuthState } from '../../../state/auth.state';
import { Contact } from '../../../core/types/contact.type';
import { TeamMember } from '../../../core/types/global.type';
import { TicketState } from '../../../state/tickets.state';
import { TicketService } from '../../../services/ticket.service';
import { Ticket, TicketStatus, TicketPriority, TICKET_STATUS } from '../../../core/types/ticket.type';

@Component({
  selector: 'app-customer-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-tickets.component.html',
  styleUrl: './customer-tickets.component.css',
})
export class CustomerTicketsComponent {

  contactState = inject(ContactState);
  authState = inject(AuthState);
  ticketState = inject(TicketState);
  ticketService = inject(TicketService);

  // toast = inject();


  searchText = '';
  selectedStatus = '';
  selectedPriority = 'All Priorities';

  priorityOptions = ['All Priorities', 'Low', 'Medium', 'High', 'Critical'];

  status = TICKET_STATUS;

  showCreateModal = false;
  newTicket = this.createEmptyTicket();

  get clients(): Contact[] {
    return this.contactState.contacts();
  }

  get teamMembers(): TeamMember[] {
    return this.authState.teamMembers().filter(member => member.role !== 'Admin');
  }


  get tickets(): Ticket[] {
    return this.ticketState.tickets();
  }

  get filteredTickets(): Ticket[] {
    const search = this.searchText.trim().toLowerCase();
    const selectedStatus = this.selectedStatus;
    const selectedPriority = this.selectedPriority;

    return this.tickets.filter(ticket => {
      const matchesSearch = !search || [
        ticket.id,
        ticket.ticketCode,
        ticket.title,
        ticket.description,
        ticket.priority,
        ticket.status,
        ticket.assignedMemberName,
        ticket.clientInfo?.name,
        ticket.clientInfo?.company,
        ticket.clientInfo?.email,
      ].some(value => value?.toLowerCase().includes(search));

      const matchesStatus = !selectedStatus || ticket.status === selectedStatus;
      const matchesPriority = selectedPriority === 'All Priorities' || ticket.priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }


  submitTicket(): void {
    if (!this.newTicket.title || !this.newTicket.description) return;

    this.showCreateModal = false;
    this.ticketService.createTicket({
      title: this.newTicket.title,
      description: this.newTicket.description,
      priority: this.newTicket.priority as TicketPriority,
      assignedToId: this.newTicket.assignedToId,
      clientId: this.newTicket.clientId || undefined
    }).subscribe({ next: () => { }, error: (err) => { console.log("ERRR : ", err) } });

    this.newTicket = this.createEmptyTicket();
  }

  deleteTicket(id: string): void {
    if (confirm('Are you sure you want to delete this incident record permanently?')) {
      this.ticketService.deleteTicket(id).subscribe();
    }
  }

  changeStatus(ticket: Ticket, nextStatus: TicketStatus): void {
    this.ticketState.updateTicket(ticket.id, { status: nextStatus });
    this.ticketService.updateStatus(ticket.id, nextStatus).subscribe();
  }

  changeAssignee(ticket: Ticket, userId: string): void {
    const teamMember = this.teamMembers.find(member => member.id == userId);
    this.ticketState.updateTicket(ticket.id, { assignedMemberName: teamMember?.name })
    this.ticketService.updateAssignee(ticket.id, userId).subscribe();
  }

  hasTeamMember(memberId: string): boolean {
    return this.teamMembers.some(member => member.id === memberId);
  }


  getPriorityClass(priority: string): string {
    return priority ? priority.toLowerCase() : 'low';
  }



  closeModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showCreateModal = false;
    }
  }

  private createEmptyTicket() {
    return {
      title: '',
      description: '',
      clientId: '',
      priority: 'Low',
      assignedToId: '',
    };
  }
}
