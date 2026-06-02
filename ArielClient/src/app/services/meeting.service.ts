import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Meeting, CreateMeetingPayload } from '../core/types/meeting.type';
import { endpoints } from '../core/constants/endpoints';

@Injectable({ providedIn: 'root' })
export class MeetingService {
    private http = inject(HttpClient);

    getAllMeetings(): Observable<Meeting[]> {
        return this.http.get<Meeting[] | { data: Meeting[] }>(endpoints.meetings).pipe(
            map((response) => Array.isArray(response) ? response : response.data ?? [])
        );
    }

    createMeeting(meeting: CreateMeetingPayload): Observable<Meeting> {
        return this.http.post<Meeting>(endpoints.meetings, meeting);
    }

    deleteMeeting(id: string): Observable<void> {
        return this.http.delete<void>(`${endpoints.meetings}/${id}`);
    }
}
