import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Meeting {
  id: number;
  subject: string;
  company: string;
  date: string;
  time: string;
  location: string;
  notes: string;
}

export interface CalendarDay {
  dayLabel: string;
  monthLabel: string;
  date: number;
  fullDate: string;
  hasEvent: boolean;
}
@Component({
  selector: 'app-appointment-scheduler',
  imports: [CommonModule, FormsModule],

  templateUrl: './appointment-scheduler.component.html',
  styleUrl: './appointment-scheduler.component.css',
})


export class AppointmentSchedulerComponent implements OnInit {

  selectedDate = '';
  showModal = false;

  locationOptions = [
    'Google Meet Conference',
    'Zoom Call',
    'Microsoft Teams',
    'In-Person Office',
    'Phone Call',
  ];

  newMeeting = {
    subject: '',
    company: '',
    date: '',
    time: '10:00',
    location: 'Google Meet Conference',
    notes: '',
  };

  meetings: Meeting[] = [
    {
      id: 1,
      subject: 'Auth0 SSO Kickoff Session',
      company: 'Hyperion Labs',
      date: '2026-05-27',
      time: '10:00',
      location: 'Google Meet Conference',
      notes: 'Discuss SSO integration scope and timeline.',
    },
    {
      id: 2,
      subject: 'Billing Refund Review',
      company: 'Vertex Solutions',
      date: '2026-05-30',
      time: '14:00',
      location: 'Zoom Call',
      notes: 'Go over extra developer hours on SLA invoice.',
    },
    {
      id: 3,
      subject: 'API Performance Planning',
      company: 'DataSync Inc',
      date: '2026-06-01',
      time: '11:00',
      location: 'Microsoft Teams',
      notes: 'Rate limit strategy and scaling plan.',
    },
  ];

  calendarDays: CalendarDay[] = [];

  private dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  private monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  ngOnInit(): void {
    const today = new Date();
    this.selectedDate = this.toDateString(today);
    this.newMeeting.date = this.selectedDate;
    this.buildCalendar(today);
  }

  private toDateString(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private buildCalendar(from: Date): void {
    this.calendarDays = [];
    const eventDates = new Set(this.meetings.map((m) => m.date));
    for (let i = 0; i < 28; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const fullDate = this.toDateString(d);
      this.calendarDays.push({
        dayLabel: this.dayNames[d.getDay()],
        monthLabel: this.monthNames[d.getMonth()],
        date: d.getDate(),
        fullDate,
        hasEvent: eventDates.has(fullDate),
      });
    }
  }

  selectDay(day: CalendarDay): void {
    this.selectedDate = day.fullDate;
  }

  get selectedDateLabel(): string {
    const d = new Date(this.selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  get meetingsForSelected(): Meeting[] {
    return this.meetings.filter((m) => m.date === this.selectedDate);
  }

  openModal(): void {
    this.newMeeting = {
      subject: '',
      company: '',
      date: this.selectedDate,
      time: '10:00',
      location: 'Google Meet Conference',
      notes: '',
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  scheduleMeeting(): void {
    if (!this.newMeeting.subject || !this.newMeeting.company || !this.newMeeting.date) return;

    this.meetings.push({
      id: Date.now(),
      subject: this.newMeeting.subject,
      company: this.newMeeting.company,
      date: this.newMeeting.date,
      time: this.newMeeting.time,
      location: this.newMeeting.location,
      notes: this.newMeeting.notes,
    });

    const today = new Date(this.selectedDate + 'T00:00:00');
    this.buildCalendar(new Date(this.calendarDays[0].fullDate + 'T00:00:00'));
    this.closeModal();
  }

  deleteMeeting(id: number): void {
    this.meetings = this.meetings.filter((m) => m.id !== id);
    this.buildCalendar(new Date(this.calendarDays[0].fullDate + 'T00:00:00'));
  }

  getLocationDotClass(loc: string): string {
    const map: Record<string, string> = {
      'Google Meet Conference': 'dot-blue',
      'Zoom Call': 'dot-purple',
      'Microsoft Teams': 'dot-indigo',
      'In-Person Office': 'dot-green',
      'Phone Call': 'dot-orange',
    };
    return map[loc] || 'dot-blue';
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
  }
}