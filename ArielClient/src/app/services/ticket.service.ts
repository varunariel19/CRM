import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { Ticket, TicketStatus, TicketPriority, TicketPayload } from '../core/types/ticket.type';
import { TicketState } from '../state/tickets.state';
import { endpoints } from '../core/constants/endpoints';

@Injectable({ providedIn: 'root' })
export class TicketService {
    private http = inject(HttpClient);
    private state = inject(TicketState);

    private readonly apiUrl = endpoints.ticket;


    getAllTickets() {
        return this.http.get<Ticket[]>(this.apiUrl , {withCredentials : true});
    }

    searchTickets(searchTerm: string = ''): Observable<Ticket[]> {
        const params = new HttpParams().set('searchTerm', searchTerm);

        return this.http.get<Ticket[]>(`${this.apiUrl}/search`, { params }).pipe(
            tap(tickets => this.state.setTickets(tickets)),
            finalize(() => { })
        );
    }

    createTicket(ticketDto: TicketPayload): Observable<Ticket> {
        return this.http.post<Ticket>(this.apiUrl, ticketDto ,{ withCredentials: true }).pipe(
            tap(newTicket => this.state.addTicket(newTicket)),
            finalize(() => { })
        );
    }

    updateStatus(id: string, status: TicketStatus): Observable<{ message: string }> {
        const payload = { id, status };
        return this.http.patch<{ message: string }>(`${this.apiUrl}/update-status`, payload  , { withCredentials: true }).pipe(
            tap(() => this.state.moveTicketToStatus(id, status))
        );
    }

    updatePriority(id: string, priority: TicketPriority): Observable<{ message: string }> {
        const payload = { id, priority };
        return this.http.patch<{ message: string }>(`${this.apiUrl}/update-priority`, payload , { withCredentials: true }).pipe(
            tap(() => this.state.updateTicket(id, { priority }))
        );
    }

    updateAssignee(id: string, assignedToId: string): Observable<{ message: string }> {
        const payload = { id, assignedToId };
        return this.http.patch<{ message: string }>(`${this.apiUrl}/update-assignee`, payload , { withCredentials: true }).pipe(
            tap(() => this.state.updateTicket(id, { assignedToId }))
        );
    }


    deleteTicket(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}` , { withCredentials: true }).pipe(
            tap(() => this.state.removeTicket(id)),
            finalize(() => { })
        );
    }
}