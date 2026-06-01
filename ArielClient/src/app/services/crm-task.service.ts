import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../core/constants/endpoints';


export interface CrmTaskDto {
    id: string;
    title: string;
    type: string;
    dueDate: string;
    status: string;
    assignedToId: string;
    assignedToName: string | null;
    leadId: string | null;
    leadName: string | null;
    dealId: string | null;
    dealTitle: string | null;
    createdAt: string;
}

export interface CreateCrmTaskDto {
    title: string;
    type: number;
    dueDate: string;
    assignedToId: string;
    leadId: string | null;
    dealId: string | null;
}


@Injectable({ providedIn: 'root' })

export class CrmTaskService {
    private readonly http = inject(HttpClient);

    getAll(): Observable<CrmTaskDto[]> {
        return this.http.get<CrmTaskDto[]>(endpoints.tasks);
    }

    create(dto: CreateCrmTaskDto): Observable<CrmTaskDto> {
        return this.http.post<CrmTaskDto>(endpoints.tasks, dto);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${endpoints.tasks}/${id}`);
    }

    updateStatus(id: string, status: string): Observable<void> {
        return this.http.patch<void>(`${endpoints.tasks}/update-status`, { id, status });
    }
}