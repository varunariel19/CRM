import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../constants/endpoints';

export interface HistoryFilterDto {
    entityName?: string;
    entityId?: string;
    actionType?: string;
    initiatedById?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
}

export interface HistoryResponseDto {
    id: string;
    entityName: string;
    entityId: string;
    title: string;
    actionType: string;
    revertType: string;
    modifiedData?: string;
    previousState?: string;
    updatedState?: string;
    initiatedAt: string;
    initiatedById: string;
    initiatedByName?: string;
}

export interface PaginatedHistoryDto {
    items: HistoryResponseDto[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private readonly baseUrl = endpoints.history;

    constructor(private http: HttpClient) { }

    getAll(filter: HistoryFilterDto = {}): Observable<PaginatedHistoryDto> {
        let params = new HttpParams();

        if (filter.entityName) params = params.set('entityName', filter.entityName);
        if (filter.entityId) params = params.set('entityId', filter.entityId);
        if (filter.actionType) params = params.set('actionType', filter.actionType);
        if (filter.initiatedById) params = params.set('initiatedById', filter.initiatedById);
        if (filter.from) params = params.set('from', filter.from);
        if (filter.to) params = params.set('to', filter.to);
        if (filter.page) params = params.set('page', filter.page.toString());
        if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());

        return this.http.get<PaginatedHistoryDto>(this.baseUrl, { params });
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    deleteAll(): Observable<void> {
        return this.http.delete<void>(this.baseUrl);
    }

    revert(id: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/revert`, {}, { withCredentials: true });
    }
}   