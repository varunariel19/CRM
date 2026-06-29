import { inject, Injectable } from '@angular/core';
import { PermissionService } from './permission.service';
import { PermissionKey } from '../constants/permission';

class ModulePermissions {
    constructor(
        private svc: PermissionService,
        private view: PermissionKey,
        private create: PermissionKey,
        private edit: PermissionKey,
        private del: PermissionKey
    ) { }

    canView() { return this.svc.has(this.view); }
    canCreate() { return this.svc.has(this.create); }
    canEdit() { return this.svc.has(this.edit); }
    canDelete() { return this.svc.has(this.del); }
    canEditOrDel() { return this.canEdit() || this.canDelete(); }
}

class AppointmentPermissions {
    constructor(
        private svc: PermissionService,
        private view: PermissionKey,
        private create: PermissionKey,
        private edit: PermissionKey,
    ) { }

    canView() { return this.svc.has(this.view); }
    canCreate() { return this.svc.has(this.create); }
    canEdit() { return this.svc.has(this.edit); }
}

class SinglePermission {
    constructor(
        private svc: PermissionService,
        private view: PermissionKey,
    ) { }

    canView() { return this.svc.has(this.view); }

}

class DoublePermission {
    constructor(
        private svc: PermissionService,
        private view: PermissionKey,
        private edit: PermissionKey,

    ) { }

    canView() { return this.svc.has(this.view); }
    canEdit() { return this.svc.has(this.edit); }
}

@Injectable({ providedIn: 'root' })
export class PermissionFacade {

    private svc = inject(PermissionService);

    readonly leads = new ModulePermissions(this.svc, PermissionKey.LeadsView, PermissionKey.LeadsCreate, PermissionKey.LeadsEdit, PermissionKey.LeadsDelete);
    readonly deals = new ModulePermissions(this.svc, PermissionKey.DealsView, PermissionKey.DealsCreate, PermissionKey.DealsEdit, PermissionKey.DealsDelete);
    readonly customers = new ModulePermissions(this.svc, PermissionKey.CustomersView, PermissionKey.CustomersCreate, PermissionKey.CustomersEdit, PermissionKey.CustomersDelete);
    readonly tasks = new ModulePermissions(this.svc, PermissionKey.TasksView, PermissionKey.TasksCreate, PermissionKey.TasksEdit, PermissionKey.TasksDelete);
    readonly projects = new ModulePermissions(this.svc, PermissionKey.ProjectsView, PermissionKey.ProjectsCreate, PermissionKey.ProjectsEdit, PermissionKey.ProjectsDelete);
    readonly tickets = new ModulePermissions(this.svc, PermissionKey.TicketsView, PermissionKey.TicketsCreate, PermissionKey.TicketsEdit, PermissionKey.TicketsDelete);
    readonly teamMembers = new ModulePermissions(this.svc, PermissionKey.TeamMembersView, PermissionKey.TeamMembersCreate, PermissionKey.TeamMembersEdit, PermissionKey.TeamMembersDelete);
    readonly appointments = new AppointmentPermissions(this.svc, PermissionKey.AppointmentsView, PermissionKey.AppointmentsCreate, PermissionKey.AppointmentsEdit);
    readonly settings = new DoublePermission(this.svc, PermissionKey.SettingsView, PermissionKey.SettingsEdit);
    readonly dashboard = new SinglePermission(this.svc, PermissionKey.DashboardView);
    readonly auditHistory = new SinglePermission(this.svc, PermissionKey.AuditHistoryView);
    readonly taskManagement = new AppointmentPermissions(this.svc, PermissionKey.TaskManagementView, PermissionKey.TaskManagementCreate, PermissionKey.TaskManagementEdit);


}