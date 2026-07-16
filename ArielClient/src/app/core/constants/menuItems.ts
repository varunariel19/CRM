import { PermissionKey } from "./permission";

export interface MenuItem {
  idx: number;
  icon: string;
  label: string;
  route: string;
  permission: PermissionKey;
  active?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    idx: 0,
    icon: 'fas fa-chart-pie',
    label: 'Analytics Dashboard',
    route: 'analytics',
    permission: PermissionKey.DashboardView,
    active: true,
  },
  {
    idx: 1,
    icon: 'fas fa-user-friends',
    label: 'Leads Management',
    route: 'leads',
    permission: PermissionKey.LeadsView,
  },
  {

    idx: 2,
    icon: 'fas fa-user-plus',
    label: 'Customer Profiles',
    route: 'customers',
    permission: PermissionKey.CustomersView,
  },
  {
    idx: 3,

    icon: 'fas fa-square-check',
    label: 'Tasks & Follow-ups',
    route: 'tasks',
    permission: PermissionKey.TasksView,
  },
  {
    idx: 4,

    icon: 'fas fa-life-ring',
    label: 'Customer Tickets',
    route: 'tickets',
    permission: PermissionKey.TicketsView,
  },
  {
    idx: 5,

    icon: 'fas fa-calendar',
    label: 'Appointment Scheduler',
    route: 'appointments',
    permission: PermissionKey.AppointmentsView,
  },

  {
    idx: 6,

    icon: 'fas fa-tasks',
    label: 'Task Management',
    route: 'task-management',
    permission: PermissionKey.TaskManagementView,
  },

  {
    idx: 7,

    icon: 'fas fa-folder-open',
    label: 'Projects',
    route: 'projects',
    permission: PermissionKey.ProjectsView,
  },
  {
    idx: 8,

    icon: 'fas fa-comments',
    label: 'Teams',
    route: 'teams',
    permission: PermissionKey.TeamMembersView,
  },
  {
    idx: 9,

    icon: 'fas fa-users',
    label: 'Team Members',
    route: 'team-members',
    permission: PermissionKey.TeamMembersView,
  },


  // {
  //   idx: 10,

  //   icon: 'fas fa-history',
  //   label: 'Audit History',
  //   route: 'audit-history',
  //   permission: PermissionKey.AuditHistoryView,
  // }
];


export const MenuItemState = {
  analytics: 0,
  leads: 1,
  customers: 2,
  tasks: 3,
  tickets: 4,
  appointments: 5,
  "task-management": 6,
  projects: 7,
  teams: 8,
  "team-members": 9,
  // "audit-history": 10,
} as const;