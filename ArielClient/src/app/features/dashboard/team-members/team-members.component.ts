import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GlobalState } from '../../../state/global.state';
import { TeamState } from '../../../state/team.state';
import { CreateTeamMemberDto, TeamMember } from '../../../core/types/global.type';
import { TeamService } from '../../../services/team.service';
import { getAvatarColor } from '../../../utils';
import { PermissionService } from '../../../core/services/permission.service';
import { PermissionFacade } from '../../../core/services/permissionFacade.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-team-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-members.component.html',
  styleUrl: './team-members.component.css',
})
export class TeamMembersComponent implements OnInit {
  teamState = inject(TeamState);
  globalState = inject(GlobalState);
  teamService = inject(TeamService);
  permissionService = inject(PermissionService);
  toast = inject(ToastService);
  perm = inject(PermissionFacade);
  searchQuery = signal('');
  filterDepartment = signal('');
  filterDesignation = signal('');
  viewMode = signal<'grid' | 'list'>('grid');

  showAddModal = signal(false);
  showProfileModal = signal(false);
  selectedMember = signal<TeamMember | null>(null);
  isSubmitting = signal(false);
  formError = signal('');

  newMember: CreateTeamMemberDto = {
    name: '',
    email: '',
    departmentId: '',
    designationId: '',
    accessLevelId: '',
    profileImage: '',
    joinedAt: ''
  };


  filteredMembers = computed(() => {
    const members = this.teamState.teamMembers();
    const q = this.searchQuery().toLowerCase().trim();
    const dept = this.filterDepartment();
    const desig = this.filterDesignation();

    return members.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.designationId.toLowerCase().includes(q);
      const matchesDept = !dept || m.departmentId === dept;
      const matchesDesig = !desig || m.designationId === desig;
      return matchesSearch && matchesDept && matchesDesig;
    });
  });

  maxJoinDate: string = this.getTodayDateString();

  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get departments() {
    return this.globalState.departments();
  }

  get designations() {
    if (!this.newMember.departmentId) {
      return [];
    }
    return this.globalState.designations().filter(
      d => d.departmentId === this.newMember.departmentId
    );
  }

  get allDesignations() {
    return this.globalState.designations();
  }



  get teamMemberList() {
    return this.filteredMembers();
  }


  get accessLevels() {
    return this.globalState.accessLevels();
  }

  get loading() {
    return this.teamState.loading();
  }

  ngOnInit(): void {
    this.teamService.handleGetList().subscribe();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onDepartmentChange(id: string): void {
    this.filterDepartment.set(id);
  }

  onDesignationChange(id: string): void {
    this.filterDesignation.set(id);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.filterDepartment.set('');
    this.filterDesignation.set('');
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchQuery() || this.filterDepartment() || this.filterDesignation());
  }

  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }

  openAddModal(): void {
    this.newMember = {
      name: '',
      email: '',
      joinedAt: '',
      departmentId: '',
      designationId: '',
      accessLevelId: '',
      profileImage: '',
    };
    this.formError.set('');
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.formError.set('');
  }

  openProfile(member: TeamMember): void {
    this.selectedMember.set(member);
    this.showProfileModal.set(true);
  }

  closeProfile(): void {
    this.showProfileModal.set(false);
    this.selectedMember.set(null);
  }

  validateForm(): boolean {
    if (!this.newMember.name.trim()) {
      this.formError.set('Name is required.');
      return false;
    }
    if (!this.newMember.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newMember.email)) {
      this.formError.set('A valid email is required.');
      return false;
    }
    if (!this.newMember.departmentId) {
      this.formError.set('Department is required.');
      return false;
    }
    if (!this.newMember.designationId) {
      this.formError.set('Designation is required.');
      return false;
    }
    if (!this.newMember.accessLevelId) {
      this.formError.set('Access level is required.');
      return false;
    }

    if (!this.newMember.joinedAt) {
      this.formError.set('Joined At date is required.');
      return false;
    }
    return true;
  }

  handleAddMember(): void {
    this.formError.set('');
    if (!this.validateForm()) return;

    this.isSubmitting.set(true);
    this.teamService.handleCreateTeamMember({ ...this.newMember }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeAddModal();
        this.toast.success(`${this.newMember.name} as a team Member added successfully !`);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.error("Failed to add team member !");
        this.formError.set('Failed to add member. Please try again.');
      },
    });
  }

  handleDeleteMember(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Remove this team member?')) {
      this.teamService.handleDeleteTeamMember(id).subscribe();
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAvatarColor(name: string): string {
    return getAvatarColor(name);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }


  canDelete(level: number) {
    return this.permissionService.canManage(level);
  }


}