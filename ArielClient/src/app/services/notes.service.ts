import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../core/constants/endpoints';

export type RelatedEntityType = 'Contact' | 'Deal' | 'Lead';

export interface NoteDto {
    id: string;
    content: string;
    createdById: string;
    createdByName: string;
    isEdited: boolean;
    updatedAt: string | null;
}

export interface CreateNoteRequest {
    content: string;
    relatedTo: RelatedEntityType;
    relatedId: string;
    createdByName: string;
    createdById: string;
}

export interface UpdateNoteRequest {
    content: string;
}

@Injectable({ providedIn: 'root' })
export class NoteService {

    constructor(private http: HttpClient) { }

    getNotes(relatedTo: RelatedEntityType, relatedId: string): Observable<NoteDto[]> {
        const params = new HttpParams()
            .set('relatedTo', relatedTo)
            .set('relatedId', relatedId);

        return this.http.get<NoteDto[]>(endpoints.notes, { params });
    }

    createNote(request: CreateNoteRequest): Observable<NoteDto> {
        return this.http.post<NoteDto>(endpoints.notes, request);
    }

    updateNote(id: string, request: UpdateNoteRequest): Observable<NoteDto> {
        return this.http.put<NoteDto>(`${endpoints.notes}/${id}`, request);
    }

    deleteNote(id: string): Observable<void> {
        return this.http.delete<void>(`${endpoints.notes}/${id}`);
    }
}