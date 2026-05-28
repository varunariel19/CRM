/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Manager' | 'Sales Executive' | 'Support Agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
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
  assignedTo: string; // user id or name
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
  createdAt: string;
}

export type DealStage = 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  closeDate: string;
  assignedTo: string; // user id or name
  contactId: string; // links to contact
  createdAt: string;
}

export type TaskType = 'Call' | 'Email' | 'Meeting' | 'Demo';
export type TaskStatus = 'Pending' | 'Completed';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  dueDate: string;
  status: TaskStatus;
  assignedTo: string; // user id or name
  leadId?: string;
  dealId?: string;
  createdAt: string;
}

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string; // user id or name
  clientId: string; // contact or client id
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  client: string; // client contact name or company
  date: string;
  time: string;
  location: string;
  notes: string;
  leadId?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  content: string;
  relatedTo: 'lead' | 'contact' | 'deal' | 'ticket';
  relatedId: string;
  createdBy: string; // name or email
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  performedBy: string; // name
  relatedTo?: 'lead' | 'contact' | 'deal' | 'task' | 'ticket' | 'meeting';
  relatedId?: string;
  createdAt: string;
}
