import { Injectable, computed, signal } from '@angular/core';
import { Meeting } from '../core/types/meeting.type';

@Injectable({
    providedIn: 'root'
})
export class MeetingState {

    private _meetings = signal<Meeting[]>([]);
    private _selectedMeeting = signal<Meeting | null>(null);

    meetings = computed(() => this._meetings());
    selectedMeeting = computed(() => this._selectedMeeting());

    totalMeetings = computed(() => this._meetings().length);

    hasMeetings = computed(() =>
        this._meetings().length > 0
    );

    upcomingMeetings = computed(() => {
        const now = new Date();

        return this._meetings()
            .filter(m => new Date(`${m.date}T${m.time}`) >= now)
            .sort((a, b) =>
                new Date(`${a.date}T${a.time}`).getTime() -
                new Date(`${b.date}T${b.time}`).getTime()
            );
    });


    setMeetings(meetings: Meeting[]): void {
        this._meetings.set(meetings);
    }

    addNewMeeting(meeting: Meeting): void {
        this._meetings.update(prev => [meeting, ...prev]);
    }

    removeMeeting(id: string): void {
        this._meetings.update(prev =>
            prev.filter(m => m.id !== id)
        );
    }

    updateMeeting(
        id: string,
        updated: Partial<Meeting>
    ): void {
        this._meetings.update(prev =>
            prev.map(m =>
                m.id === id
                    ? { ...m, ...updated }
                    : m
            )
        );
    }

    selectMeeting(meeting: Meeting | null): void {
        this._selectedMeeting.set(meeting);
    }


    clear(): void {
        this._meetings.set([]);
        this._selectedMeeting.set(null);
    }
}