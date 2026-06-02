export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  leadId: string;
  clientInfo: {
    name: string;
    company: string;
    email: string;
  }
  createdAt: string;
}

export interface CreateMeetingPayload {
  title: string;
  leadId: string | null;
  date: string;
  time: string;
  location: string;
  notes?: string;
}


export interface CalendarDay {
  dayLabel: string;
  monthLabel: string;
  date: number;
  fullDate: string;
  meetingCount: number;
}

export interface LocationOption {
  label: string;
  value: string;
  icon: string;
  dotClass: string;
}