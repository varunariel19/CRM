import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthState } from '../state/auth.state';
import { endpoints, } from '../core/constants/endpoints';
import { CreateLeadDto, LeadResponseDto, UpdateLeadDto } from '../core/types/lead.type';


@Injectable({ providedIn: 'root' })
export class LeadService {

    constructor(private http: HttpClient) { }


    handleGetLeads(): Observable<LeadResponseDto[]> {
        return this.http.get<LeadResponseDto[] | { data: LeadResponseDto[] }>(endpoints.getLeads, {
            withCredentials: true
        }).pipe(
            map((response) => Array.isArray(response) ? response : response.data ?? [])
        );
    }

    handleSearchLead(value: string): Observable<LeadResponseDto[]> {
        return this.http.get<LeadResponseDto[] | { data: LeadResponseDto[] }>(`${endpoints.searchLeads}${encodeURIComponent(value)}`, {
            withCredentials: true
        }).pipe(
            map((response) => Array.isArray(response) ? response : response.data ?? [])
        );
    }

    handleCreateLead(dto: CreateLeadDto): Observable<LeadResponseDto> {
        return this.http.post<LeadResponseDto>(endpoints.createLead, dto, {
            withCredentials: true
        });
    }

    handleUpdateLead(id: string, dto: UpdateLeadDto): Observable<LeadResponseDto> {
        return this.http.put<LeadResponseDto>(endpoints.updateLead(id), dto, {
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
