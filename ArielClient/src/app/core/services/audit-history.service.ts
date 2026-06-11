import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../constants/endpoints';

export interface HistoryResponseDto {
  id: string;
  entityName: string;
  entityId: string;
  entityDisplayName?: string;
  title: string;
  actionType: string;
  revertType: string;
  diffData?: string;
  affectedFields?: string;
  previousState?: string;
  updatedState?: string;
  isReverted: boolean;
  revertedAt?: string;
  status: string;
  source: string;
  ipAddress?: string;
  correlationId?: string;
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
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface HistoryFilterDto {
  page?: number;
  pageSize?: number;
  actionType?: string;
  isReverted?: boolean;
  from?: string;
  to?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditHistoryService {
  private http = inject(HttpClient);
  private base = `${endpoints.history}`;

  getByEntity(
    entityName: string,
    entityId: string
  ): Observable<HistoryResponseDto[]> {
    return this.http.get<HistoryResponseDto[]>(
      `${this.base}/entity/${entityName}/${entityId}`, { withCredentials: true });
  }

  getAll(filter: HistoryFilterDto): Observable<PaginatedHistoryDto> {
    let params = new HttpParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params = params.set(k, String(v));
    });
    return this.http.get<PaginatedHistoryDto>(this.base, { params, withCredentials: true });
  }

  revert(auditLogId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${auditLogId}/revert`, {}, { withCredentials: true });
  }
}