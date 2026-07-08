import { HistoryFilterDto, HistoryResponseDto, PaginatedHistoryDto } from '../../interface/history.type';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../constants/endpoints';


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