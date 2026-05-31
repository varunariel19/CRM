import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { endpoints, } from '../core/constants/endpoints';
import { CreateLeadDto, Lead, UpdateLeadDto } from '../core/types/lead.type';


@Injectable({ providedIn: 'root' })
export class LeadService {

    constructor(private http: HttpClient) { }


    handleGetLeads(): Observable<Lead[]> {
        return this.http.get<Lead[] | { data: Lead[] }>(endpoints.getLeads, {
            withCredentials: true
        }).pipe(
            map((response) => Array.isArray(response) ? response : response.data ?? [])
        );
    }

    handleSearchLead(value: string): Observable<Lead[]> {
        return this.http.get<Lead[] | { data: Lead[] }>(`${endpoints.searchLeads}${encodeURIComponent(value)}`, {
            withCredentials: true
        }).pipe(
            map((response) => Array.isArray(response) ? response : response.data ?? [])
        );
    }

    handleCreateLead(dto: CreateLeadDto): Observable<Lead> {
        return this.http.post<Lead>(endpoints.createLead, dto, {
            withCredentials: true
        });
    }

    handleUpdateLead(id: string, dto: UpdateLeadDto): Observable<Lead> {
        return this.http.put<Lead>(endpoints.updateLead(id), dto, {
            withCredentials: true
        });
    }

    handleRemoveLead(id: string): Observable<void> {
        return this.http.delete<void>(endpoints.deleteLead(id), {
            withCredentials: true
        });
    }

    handleFilterByStatus() {

    }

    handleFilterBySources() {

    }
}
