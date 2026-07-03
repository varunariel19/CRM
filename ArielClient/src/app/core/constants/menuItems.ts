import { PermissionKey } from "./permission";

export interface MenuItem {
  icon: string;
  label: string;
  route: string;
  permission: PermissionKey;
  active?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    icon: 'fas fa-chart-pie',
    label: 'Analytics Dashboard',
    route: 'analytics',
    permission: PermissionKey.DashboardView,
    active: true,
  },
  {
    icon: 'fas fa-user-friends',
    label: 'Leads Management',
    route: 'leads',
    permission: PermissionKey.LeadsView,
  },
  {
    icon: 'fas fa-user-plus',
    label: 'Customer Profiles',
    route: 'customers',
    permission: PermissionKey.CustomersView,
  },
  {
    icon: 'fas fa-square-check',
    label: 'Tasks & Follow-ups',
    route: 'tasks',
    permission: PermissionKey.TasksView,
  },
  {
    icon: 'fas fa-life-ring',
    label: 'Customer Tickets',
    route: 'tickets',
    permission: PermissionKey.TicketsView,
  },
  {
    icon: 'fas fa-calendar',
    label: 'Appointment Scheduler',
    route: 'appointments',
    permission: PermissionKey.AppointmentsView,
  },
  {
    icon: 'fas fa-folder-open',
    label: 'Projects',
    route: 'projects',
    permission: PermissionKey.ProjectsView,
  },
  {
    icon: 'fas fa-users',
    label: 'Team Members',
    route: 'team-members',
    permission: PermissionKey.TeamMembersView,
  },
  {
    icon: 'fas fa-comments',
    label: 'Teams',
    route: 'teams',
    permission: PermissionKey.TeamMembersView,
  },
  {
    icon: 'fas fa-tasks',
    label: 'Task Management',
    route: 'task-management',
    permission: PermissionKey.TaskManagementView,
  },
  {
    icon: 'fas fa-history',
    label: 'Audit History',
    route: 'audit-history',
    permission: PermissionKey.AuditHistoryView,
  }
];


export const MenuItemState = {
  analytics: 0,
  leads: 1,
  customers: 2,
  tasks: 3,
  tickets: 4,
  appointments: 5,
  projects: 6,
  "team-members": 7,
  teams: 8,
  "task-management": 9,
  "audit-history": 10,
} as const;