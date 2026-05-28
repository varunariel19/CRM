export type UserRole = 'Admin' | 'Manager' | 'Sales Executive' | 'Support Agent';

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export type LeadSource = 'Website' | 'Referral' | 'LinkedIn' | 'Email Campaign';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  designation: string;
  email: string;
  phone: string;
  address: string;
}

export type DealStage = 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  closeDate: string;
  assignedTo: string;
  contactId: string;
}

export type TaskStatus = 'Pending' | 'Completed';
export type TaskType = 'Call' | 'Email' | 'Meeting' | 'Demo';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  dueDate: string;
  status: TaskStatus;
  assignedTo: string;
  leadId?: string;
  dealId?: string;
}

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string;
  clientId: string;
}

export interface Meeting {
  id: string;
  title: string;
  client: string;
  date: string;
  time: string;
  location: string;
  notes: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  performedBy: string;
  createdAt: string;
}
