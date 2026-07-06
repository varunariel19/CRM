export type TaskStatus = 'Pending' | 'Completed';
export type TaskType = 'Call' | 'Email' | 'Meeting' | 'Demo';


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


// global.type.ts
export interface TeamMember {
  id: string;
  employeeId: string;
  profileImage?: string;
  name: string;
  email: string;
  departmentId: string;
  designationId: string;
  access: number;
  accessLevelId : string;
  createdAt: string;
}

export interface UserDetails {
  id: string;
  name: string;
  profileImage?: string;
}

export interface CreateTeamMemberDto {
  name: string;
  email: string;
  employeeId: string;
  departmentId: string;
  designationId: string;
  accessLevelId: string;
  profileImage?: File | null;
}

export interface UpdateTeamMemberDto {
  id?: string;
  employeeId: string;
  name: string;
  email: string;
  departmentId: string;
  designationId: string;
  accessLevelId: string;
  profileImage?: string | File | null;
}


export type UserRole = 'hr' | 'admin' | 'employee';