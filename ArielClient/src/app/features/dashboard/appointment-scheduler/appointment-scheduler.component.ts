import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarDay, CreateMeetingPayload, LocationOption, Meeting } from '../../../core/types/meeting.type';
import { MeetingService } from '../../../services/meeting.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { MenuState } from '../../../state/menu.state';
import { LeadState } from '../../../state/lead.state';
import { MeetingState } from '../../../state/meeting.state';
import { PermissionFacade } from '../../../core/services/permissionFacade.service';


@Component({
  selector: 'app-appointment-scheduler',
  imports: [CommonModule, FormsModule],

  templateUrl: './appointment-scheduler.component.html',
  styleUrl: './appointment-scheduler.component.css',
})


export class AppointmentSchedulerComponent implements OnInit {
  private readonly meetingService = inject(MeetingService);
  private leadState = inject(LeadState);
  private readonly toast = inject(ToastService);
  private readonly loader = inject(LoaderService);
  private readonly menuState = inject(MenuState);
  private readonly meetingState = inject(MeetingState);
  perm = inject(PermissionFacade);
  selectedDate = '';
  showModal = false;
  isLocationDropdownOpen = false;
  isSubmitting = false;
  isDateFixed = false;
  errorMsg: string | null = null;

  locationOptions: LocationOption[] = [
    { label: 'Google Meet', value: 'Google Meet Conference', icon: 'fas fa-video', dotClass: 'dot-blue' },
    { label: 'Zoom Call', value: 'Zoom Call', icon: 'fas fa-video-camera', dotClass: 'dot-purple' },
    { label: 'Microsoft Teams', value: 'Microsoft Teams', icon: 'fas fa-users', dotClass: 'dot-indigo' },
    { label: 'In-Person Meeting', value: 'In-Person Office', icon: 'fas fa-handshake', dotClass: 'dot-green' },
    { label: 'Phone Call', value: 'Phone Call', icon: 'fas fa-phone', dotClass: 'dot-orange' },
  ];

  newMeeting: CreateMeetingPayload = this.createEmptyModal();

  calendarDays: CalendarDay[] = [];

  private dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  private monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  ngOnInit(): void {
    const today = new Date();
    this.selectedDate = this.toDateString(today);
    this.buildCalendar(today);
  }

  @HostListener('document:click')
  closeLocationDropdown(): void {
    this.isLocationDropdownOpen = false;
  }


  get meetings() {
    return this.meetingState.meetings();
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

  get leads() {
    return this.leadState.leads();
  }

  get selectedLocationOption(): LocationOption {
    return this.getLocationOption(this.newMeeting.location);
  }


  scheduleMeeting(): void {
    if (!this.newMeeting.title.trim() || !this.newMeeting.leadId || !this.newMeeting.date || !this.newMeeting.time) {
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }
    this.isSubmitting = true;
    this.errorMsg = null;
    this.loader.show('Creating Meeting...', 'md');

    this.meetingService.createMeeting(this.newMeeting).subscribe({
      next: (created) => {
        this.meetingState.addNewMeeting(created);
        this.selectedDate = created.date;
        this.rebuildCalendarFromCurrentStart();
        this.isSubmitting = false;
        this.loader.hide();
        this.closeModal();
        this.toast.success('Meeting created successfully.');
      },
      error: () => {
        this.isSubmitting = false;
        this.loader.hide();
        this.toast.error('Failed to create meeting.');
      },
    });
  }

  deleteMeeting(id: string): void {
    this.menuState.open({
      title: 'Delete Meeting',
      message: 'Are you sure you want to delete this meeting?',
      onConfirm: () => {
        this.loader.show('Deleting Meeting...', 'md');

        this.meetingService.deleteMeeting(id).subscribe({
          next: () => {
            this.meetingState.removeMeeting(id);
            this.rebuildCalendarFromCurrentStart();
            this.loader.hide();
            this.toast.success('Meeting deleted successfully.');
          },
          error: () => {
            this.loader.hide();
            this.toast.error('Failed to delete meeting.');
          },
        });
      },
    });
  }



  selectDay(day: CalendarDay): void {
    this.selectedDate = day.fullDate;
  }

  selectLocation(option: LocationOption): void {
    this.newMeeting.location = option.value;
    this.isLocationDropdownOpen = false;
  }

  openModal(): void {
    this.isDateFixed = false;
    this.newMeeting = this.createEmptyModal();
    this.newMeeting.date = '';
    this.showModal = true;
  }

  openModalForDate(): void {
    this.isDateFixed = true;
    this.newMeeting = this.createEmptyModal();
    this.newMeeting.date = this.selectedDate;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isLocationDropdownOpen = false;
  }


  toggleLocationDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isLocationDropdownOpen = !this.isLocationDropdownOpen;
  }

  getLocationOption(loc: string): LocationOption {
    return this.locationOptions.find(option => option.value === loc) || this.locationOptions[0];
  }

  getLocationDotClass(loc: string): string {
    return this.getLocationOption(loc).dotClass;
  }

  getLocationIconClass(loc: string): string {
    return this.getLocationOption(loc).icon;
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
  }


  private rebuildCalendarFromCurrentStart(): void {
    const startDate = this.calendarDays[0]?.fullDate ?? this.selectedDate;
    this.buildCalendar(new Date(startDate + 'T00:00:00'));
  }

  

  private toDateString(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private buildCalendar(from: Date): void {
    this.calendarDays = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const fullDate = this.toDateString(d);
      this.calendarDays.push({
        dayLabel: this.dayNames[d.getDay()],
        monthLabel: this.monthNames[d.getMonth()],
        date: d.getDate(),
        fullDate,
        meetingCount: this.meetings.filter(m => m.date === fullDate).length,
      });
    }
  }

  private createEmptyModal(): CreateMeetingPayload {
    return {
      title: '',
      date: this.selectedDate,
      leadId: null,
      time: '10:00',
      location: 'Google Meet Conference',
      notes: '',
    }
  }
}