export enum PermissionKey {
    DashboardView = 'DashboardView',

    LeadsView = 'LeadsView',
    LeadsCreate = 'LeadsCreate',
    LeadsEdit = 'LeadsEdit',
    LeadsDelete = 'LeadsDelete',

    DealsView = 'DealsView',
    DealsCreate = 'DealsCreate',
    DealsEdit = 'DealsEdit',
    DealsDelete = 'DealsDelete',

    CustomersView = 'CustomersView',
    CustomersCreate = 'CustomersCreate',
    CustomersEdit = 'CustomersEdit',
    CustomersDelete = 'CustomersDelete',

    TasksView = 'TasksView',
    TasksCreate = 'TasksCreate',
    TasksEdit = 'TasksEdit',
    TasksDelete = 'TasksDelete',

    ProjectsView = 'ProjectsView',
    ProjectsCreate = 'ProjectsCreate',
    ProjectsEdit = 'ProjectsEdit',
    ProjectsDelete = 'ProjectsDelete',

    TicketsView = 'TicketsView',
    TicketsCreate = 'TicketsCreate',
    TicketsEdit = 'TicketsEdit',
    TicketsDelete = 'TicketsDelete',

    AppointmentsView = 'AppointmentsView',
    AppointmentsCreate = 'AppointmentsCreate',
    AppointmentsEdit = 'AppointmentsEdit',

    TeamMembersView = 'TeamMembersView',
    TeamMembersCreate = 'TeamMembersCreate',
    TeamMembersEdit = 'TeamMembersEdit',
    TeamMembersDelete = 'TeamMembersDelete',

    AuditHistoryView = 'AuditHistoryView',

    SettingsView = 'SettingsView',
    SettingsEdit = 'SettingsEdit',
}

export const PermissionCodeMap: Record<PermissionKey, string> = {
    [PermissionKey.DashboardView]: 'Dashboard.View',

    [PermissionKey.LeadsView]: 'Leads.View',
    [PermissionKey.LeadsCreate]: 'Leads.Create',
    [PermissionKey.LeadsEdit]: 'Leads.Edit',
    [PermissionKey.LeadsDelete]: 'Leads.Delete',

    [PermissionKey.DealsView]: 'Deals.View',
    [PermissionKey.DealsCreate]: 'Deals.Create',
    [PermissionKey.DealsEdit]: 'Deals.Edit',
    [PermissionKey.DealsDelete]: 'Deals.Delete',

    [PermissionKey.CustomersView]: 'Customers.View',
    [PermissionKey.CustomersCreate]: 'Customers.Create',
    [PermissionKey.CustomersEdit]: 'Customers.Edit',
    [PermissionKey.CustomersDelete]: 'Customers.Delete',

    [PermissionKey.TasksView]: 'Tasks.View',
    [PermissionKey.TasksCreate]: 'Tasks.Create',
    [PermissionKey.TasksEdit]: 'Tasks.Edit',
    [PermissionKey.TasksDelete]: 'Tasks.Delete',

    [PermissionKey.ProjectsView]: 'Projects.View',
    [PermissionKey.ProjectsCreate]: 'Projects.Create',
    [PermissionKey.ProjectsEdit]: 'Projects.Edit',
    [PermissionKey.ProjectsDelete]: 'Projects.Delete',

    [PermissionKey.TicketsView]: 'Tickets.View',
    [PermissionKey.TicketsCreate]: 'Tickets.Create',
    [PermissionKey.TicketsEdit]: 'Tickets.Edit',
    [PermissionKey.TicketsDelete]: 'Tickets.Delete',

    [PermissionKey.AppointmentsView]: 'Appointments.View',
    [PermissionKey.AppointmentsCreate]: 'Appointments.Create',
    [PermissionKey.AppointmentsEdit]: 'Appointments.Edit',

    [PermissionKey.TeamMembersView]: 'TeamMembers.View',
    [PermissionKey.TeamMembersCreate]: 'TeamMembers.Create',
    [PermissionKey.TeamMembersEdit]: 'TeamMembers.Edit',
    [PermissionKey.TeamMembersDelete]: 'TeamMembers.Delete',

    [PermissionKey.AuditHistoryView]: 'AuditHistory.View',

    [PermissionKey.SettingsView]: 'Settings.View',
    [PermissionKey.SettingsEdit]: 'Settings.Edit',
};