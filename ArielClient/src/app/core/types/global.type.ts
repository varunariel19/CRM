export type UserRole = 'Admin' | 'Manager' | 'SalesExecutive' | 'BDE' | 'SupportAgent';



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



export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}