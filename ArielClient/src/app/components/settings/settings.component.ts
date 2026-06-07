import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { AccessLevelItem, GlobalState, PermissionItem } from '../../state/global.state';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookUpService } from '../../core/services/lookup.service';
import { LoaderService } from '../../core/services/loader.service';
import { ToastService } from '../../core/services/toast.service';
type SettingsTab = 'roles' | 'permissions' | 'departments' | 'designations';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {

  @Output() close = new EventEmitter<void>();

  lookupState = inject(GlobalState);
  lookupService = inject(LookUpService);
  loader = inject(LoaderService);
  toast = inject(ToastService);


  activeTab = signal<SettingsTab>('roles');

  editingId = signal<string | null>(null);
  editingName = signal('');

  newDeptName = signal('');
  newDesigName = signal('');
  newDesigDeptId = signal('');

  selectedRoleId = signal<string | null>(null);
  selectedRolePermissions = signal<string[]>([]);

  isSaving = signal(false);

  tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'roles', label: 'Access Levels', icon: 'fa-shield-halved' },
    { key: 'permissions', label: 'Permissions', icon: 'fa-key' },
    { key: 'departments', label: 'Departments', icon: 'fa-building' },
    { key: 'designations', label: 'Designations', icon: 'fa-id-badge' },
  ];

  setTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
    this.cancelEdit();
    this.selectedRoleId.set(null);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }

  startEdit(id: string, name: string): void {
    this.editingId.set(id);
    this.editingName.set(name);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editingName.set('');
  }

  saveEdit(type: 'dept' | 'desig'): void {
    const id = this.editingId();
    const name = this.editingName().trim();
    if (!id || !name) return;

    if (type === 'dept') {
      this.lookupService.updateDepartment(id, name).subscribe(updated => {
        const list = this.lookupState.departments().map(d => d.id === id ? { ...d, name: updated.name } : d);
        this.lookupState.setDepartments(list);
        this.cancelEdit();
      });
    } else {
      this.lookupService.updateDesignation(id, name).subscribe(updated => {
        const list = this.lookupState.designations().map(d => d.id === id ? { ...d, name: updated.name } : d);
        this.lookupState.setDesignations(list);
        this.cancelEdit();
      });
    }
  }

  deleteDept(id: string): void {
    this.lookupService.deleteDepartment(id).subscribe(() => {
      this.lookupState.setDepartments(this.lookupState.departments().filter(d => d.id !== id));
    });
  }

  deleteDesig(id: string): void {
    this.lookupService.deleteDesignation(id).subscribe(() => {
      this.lookupState.setDesignations(this.lookupState.designations().filter(d => d.id !== id));
    });
  }

  addDepartment(): void {
    const name = this.newDeptName().trim();
    if (!name) return;

    this.lookupService.addDepartment(name).subscribe(created => {
      this.lookupState.setDepartments([...this.lookupState.departments(), created]);
      this.newDeptName.set('');
    });
  }

  addDesignation(): void {
    const name = this.newDesigName().trim();
    const deptId = this.newDesigDeptId();
    if (!name || !deptId) return;

    this.lookupService.addDesignation(name, deptId).subscribe(created => {
      this.lookupState.setDesignations([...this.lookupState.designations(), created]);
      this.newDesigName.set('');
      this.newDesigDeptId.set('');
    });
  }

  openRolePermissions(role: AccessLevelItem): void {
    this.selectedRoleId.set(role.id);
    this.selectedRolePermissions.set(role.permissions.map(p => p.id));
  }

  selectedRoleName(): string {
    return this.lookupState.accessLevels().find(r => r.id === this.selectedRoleId())?.name ?? '';
  }

  isPermissionSelected(permId: string): boolean {
    return this.selectedRolePermissions().includes(permId);
  }

  togglePermission(permId: string): void {
    const current = this.selectedRolePermissions();
    this.selectedRolePermissions.set(
      current.includes(permId) ? current.filter(p => p !== permId) : [...current, permId]
    );
  }

  saveRolePermissions(): void {
    const id = this.selectedRoleId();
    if (!id) return;

    this.isSaving.set(true);
    this.loader.show("saving permission...", 'lg');
    this.lookupService.updateAccessLevelPermissions(id, this.selectedRolePermissions()).subscribe({
      next: () => {
        const permIds = this.selectedRolePermissions();
        const allPerms = this.lookupState.permissions();
        const updatedPerms = allPerms.filter(p => permIds.includes(p.id));

        const updatedLevels = this.lookupState.accessLevels().map(r =>
          r.id === id ? { ...r, permissions: updatedPerms } : r
        );
        this.lookupState.setAccessLevels(updatedLevels);
        this.loader.hide();
        this.toast.success("updated permission successfully !");
        this.isSaving.set(false);
        this.selectedRoleId.set(null);
      },
      error: () => {
        this.isSaving.set(false);
        this.loader.hide();
        this.toast.success("failed to update the permission !");
      }
    });
  }

  getDeptName(deptId: string): string {
    return this.lookupState.departments().find(d => d.id === deptId)?.name ?? '';
  }

  groupedPermissions() {
    const groups: Record<string, PermissionItem[]> = {};
    for (const p of this.lookupState.permissions()) {
      const [module] = p.code.split('.');
      if (!groups[module]) groups[module] = [];
      groups[module].push(p);
    }
    return Object.entries(groups);
  }
}

