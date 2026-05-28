import { ActivityLog, Contact, CrmUser, Deal, Lead, Meeting, Task, Ticket } from '../models/crm.models';

export const USERS: CrmUser[] = [
  { id: 'u-1', name: 'Varun Ariel', email: 'varunariel@gmail.com', password: 'admin123', role: 'Admin' },
  { id: 'u-2', name: 'Sarah Miller', email: 'sarah@arielcrm.com', password: 'manager123', role: 'Manager' },
  { id: 'u-3', name: 'David Carter', email: 'david@arielcrm.com', password: 'sales123', role: 'Sales Executive' },
  { id: 'u-4', name: 'Emily Watson', email: 'emily@arielcrm.com', password: 'support123', role: 'Support Agent' }
];

export const LEADS: Lead[] = [
  { id: 'l-1', name: 'John Doe', company: 'Acme Corp', email: 'john@acme.com', phone: '+1 555 123 4567', source: 'Referral', status: 'New', assignedTo: 'David Carter', createdAt: '2026-05-23T10:29:13.932Z' },
  { id: 'l-2', name: 'Alice Smith', company: 'Vertex Solutions', email: 'alice@vertex.io', phone: '+1 555 987 6543', source: 'Website', status: 'Contacted', assignedTo: 'David Carter', createdAt: '2026-05-24T10:29:13.932Z' },
  { id: 'l-3', name: 'Bob Johnson', company: 'Nexus Tech', email: 'bob@nexus.com', phone: '+1 555 456 7890', source: 'Referral', status: 'Qualified', assignedTo: 'David Carter', createdAt: '2026-05-25T10:29:13.932Z' },
  { id: 'l-4', name: 'Carol Williams', company: 'Hyperion Labs', email: 'carol@hyperion.com', phone: '+1 555 222 3333', source: 'Email Campaign', status: 'Converted', assignedTo: 'David Carter', createdAt: '2026-05-26T10:29:13.932Z' },
  { id: 'l-5', name: 'David Brown', company: 'Initech Inc', email: 'david@initech.com', phone: '+1 555 444 5555', source: 'LinkedIn', status: 'Lost', assignedTo: 'Sarah Miller', createdAt: '2026-05-27T10:29:13.932Z' }
];

export const CONTACTS: Contact[] = [
  { id: 'c-1', name: 'John Doe', company: 'Acme Corp', designation: 'CTO', email: 'john@acme.com', phone: '+1 555 123 4567', address: '123 Enterprise Way, Tech City, CA 94016' },
  { id: 'c-2', name: 'Alice Smith', company: 'Vertex Solutions', designation: 'IT Director', email: 'alice@vertex.io', phone: '+1 555 987 6543', address: '456 Innovation Blvd, Cloud City, WA 98101' },
  { id: 'c-3', name: 'Bob Johnson', company: 'Nexus Tech', designation: 'Engineering Lead', email: 'bob@nexus.com', phone: '+1 555 456 7890', address: '789 Paradigm Drive, Austin, TX 78701' },
  { id: 'c-4', name: 'Carol Williams', company: 'Hyperion Labs', designation: 'CEO', email: 'carol@hyperion.com', phone: '+1 555 222 3333', address: '101 Summit Ridge, Boston, MA 02108' }
];

export const DEALS: Deal[] = [
  { id: 'd-1', title: 'Cloud Infrastructure Migration', value: 45000, stage: 'Lost', closeDate: '2026-06-12', assignedTo: 'David Carter', contactId: 'c-1' },
  { id: 'd-2', title: 'Custom CRM Development', value: 72000, stage: 'Proposal', closeDate: '2026-05-27', assignedTo: 'David Carter', contactId: 'c-4' },
  { id: 'd-3', title: 'Cybersecurity Threat Audit', value: 18000, stage: 'Won', closeDate: '2026-06-22', assignedTo: 'Varun Ariel', contactId: 'c-2' },
  { id: 'd-4', title: 'Managed Kubernetes Hosting', value: 34000, stage: 'Won', closeDate: '2026-05-22', assignedTo: 'Sarah Miller', contactId: 'c-3' }
];

export const TASKS: Task[] = [
  { id: 't-1', title: 'Follow-up Call on Proposal', type: 'Call', dueDate: '2026-05-29', status: 'Completed', assignedTo: 'David Carter', leadId: 'l-1' },
  { id: 't-2', title: 'Prepare Technical Architecture Demo', type: 'Demo', dueDate: '2026-05-31', status: 'Completed', assignedTo: 'David Carter', dealId: 'd-1' },
  { id: 't-3', title: 'Send Introductory Email Campaign', type: 'Email', dueDate: '2026-05-27', status: 'Pending', assignedTo: 'David Carter', leadId: 'l-4' },
  { id: 't-4', title: 'Introductory Discovery Meeting', type: 'Meeting', dueDate: '2026-05-30', status: 'Pending', assignedTo: 'Sarah Miller', leadId: 'l-2' }
];

export const TICKETS: Ticket[] = [
  { id: 'tk-2', title: 'SSO Integration Request', description: 'Client wants to explore Auth0 SSO setup for their customer hub.', status: 'Open', priority: 'Medium', assignedTo: 'Emily Watson', clientId: 'c-4' },
  { id: 'tk-3', title: 'Billing Discrepancy SLA', description: 'SLA invoice lists extra developer hours that need to be refunded.', status: 'In Progress', priority: 'Low', assignedTo: 'Sarah Miller', clientId: 'c-2' }
];

export const MEETINGS: Meeting[] = [
  { id: 'm-1', title: 'Architecture Review Session', client: 'Acme Corp', date: '2026-05-30', time: '14:30', location: 'Google Meet', notes: 'Design review for cloud migration blueprint.' },
  { id: 'm-2', title: 'ArielCRM Portal Walkthrough', client: 'Hyperion Labs', date: '2026-06-01', time: '10:00', location: 'Zoom', notes: 'Demonstrate custom features built this week.' },
  { id: 'm-3', title: 'Introductory Call with Vertex', client: 'Vertex Solutions', date: '2026-05-27', time: '11:00', location: 'Microsoft Teams', notes: 'Understanding cybersecurity parameters.' }
];

export const ACTIVITIES: ActivityLog[] = [
  { id: 'a-1', action: 'Moved Custom CRM Development to Proposal stage', performedBy: 'Sarah Miller', createdAt: '2026-05-28T10:38:20.140Z' },
  { id: 'a-2', action: 'Updated Lead for John Doe', performedBy: 'Sarah Miller', createdAt: '2026-05-28T10:37:26.406Z' },
  { id: 'a-3', action: 'Changed Billing Discrepancy SLA to In Progress', performedBy: 'Sarah Miller', createdAt: '2026-05-28T10:31:08.795Z' },
  { id: 'a-4', action: 'Marked Follow-up Call on Proposal as Completed', performedBy: 'David Carter', createdAt: '2026-05-28T10:34:38.412Z' }
];
