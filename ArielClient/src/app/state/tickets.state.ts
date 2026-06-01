import { Injectable, signal, computed } from '@angular/core';
import { Ticket, TicketStatus, TicketPipelineColumn, TICKET_STATUS, TICKET_PRIORITY } from '../core/types/ticket.type';

const PIPELINE_COLUMNS: Omit<TicketPipelineColumn, 'tickets'>[] = [
    { key: 'open', title: 'OPEN', color: '#3b82f6', status: TICKET_STATUS.OPEN },
    { key: 'in-progress', title: 'IN PROGRESS', color: '#f59e0b', status: TICKET_STATUS.IN_PROGRESS },
    { key: 'resolved', title: 'RESOLVED', color: '#10b981', status: TICKET_STATUS.RESOLVED },
    { key: 'closed', title: 'CLOSED', color: '#6b7280', status: TICKET_STATUS.CLOSED },
];

@Injectable({ providedIn: 'root' })
export class TicketState {

    private _tickets = signal<Ticket[]>([]);
    private _isLoading = signal(false);
    private _selectedTicket = signal<Ticket | null>(null);

    tickets = computed(() => this._tickets());
    isLoading = computed(() => this._isLoading());
    selectedTicket = computed(() => this._selectedTicket());

    totalTickets = computed(() => this._tickets().length);
    hasTickets = computed(() => this._tickets().length > 0);

    pipelineColumns = computed<TicketPipelineColumn[]>(() =>
        PIPELINE_COLUMNS.map(col => ({
            ...col,
            tickets: this._tickets().filter(t => t.status === col.status),
        }))
    );

    criticalAndHighCount = computed(() =>
        this._tickets().filter(t => 
            t.status !== TICKET_STATUS.CLOSED && 
            (t.priority === TICKET_PRIORITY.CRITICAL || t.priority === TICKET_PRIORITY.HIGH)
        ).length
    );

    activeTicketsCount = computed(() =>
        this._tickets().filter(t => 
            t.status === TICKET_STATUS.OPEN || t.status === TICKET_STATUS.IN_PROGRESS
        ).length
    );

    ticketsByStatus = computed(() => {
        const map = new Map<TicketStatus, Ticket[]>();
        for (const status of Object.values(TICKET_STATUS)) {
            map.set(status, []);
        }
        for (const ticket of this._tickets()) {
            map.get(ticket.status)!.push(ticket);
        }
        return map;
    });


    setTickets(tickets: Ticket[]): void {
        this._tickets.set(tickets);
    }

    addTicket(ticket: Ticket): void {
        this._tickets.update(tickets => [ticket, ...tickets]);
    }

    removeTicket(id: string): void {
        this._tickets.update(tickets => tickets.filter(t => t.id !== id));
        if (this._selectedTicket()?.id === id) {
            this._selectedTicket.set(null);
        }
    }

    updateTicket(id: string, updated: Partial<Ticket>): void {
        this._tickets.update(tickets =>
            tickets.map(t => t.id === id ? { ...t, ...updated } : t)
        );
        if (this._selectedTicket()?.id === id) {
            this._selectedTicket.update(t => t ? { ...t, ...updated } : null);
        }
    }

    moveTicketToStatus(id: string, status: TicketStatus): void {
        this.updateTicket(id, { status });
    }

    selectTicket(ticket: Ticket | null): void {
        this._selectedTicket.set(ticket);
    }

    clear(): void {
        this._tickets.set([]);
        this._selectedTicket.set(null);
    }
}