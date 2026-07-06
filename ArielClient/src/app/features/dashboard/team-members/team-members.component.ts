import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GlobalState } from '../../../state/global.state';
import { TeamState } from '../../../state/team.state';
import { CreateTeamMemberDto, TeamMember, UpdateTeamMemberDto } from '../../../core/types/global.type';
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
  imagePreview = signal<string | null>(null);

  newMember: CreateTeamMemberDto = {
    name: '',
    email: '',
    employeeId: '',
    departmentId: '',
    designationId: '',
    accessLevelId: '',
    profileImage: null,
  };

  filteredMembers = computed(() => {
    const members = [...this.teamState.teamMembers()].sort((a, b) =>
      a.name.toLowerCase().trim().localeCompare(b.name.toLowerCase().trim())
    );


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


  showEditModal = signal(false);
  editMember: (UpdateTeamMemberDto) | null = null;
  originalEditMember: (TeamMember & { accessLevel?: string }) | null = null; // ADD THIS
  editImagePreview = signal<string | null>(null);
  isSubmittingEdit = signal(false);
  editFormError = signal('');

  showDeleteModal = signal(false);
  memberToDelete = signal<TeamMember | null>(null);
  deleteConfirmText = signal('');
  isDeletingMember = signal(false);

  readonly DELETE_CONFIRM_PHRASE = 'DELETE MEMBER';

  get isDeleteConfirmed(): boolean {
    return this.deleteConfirmText().trim().toUpperCase() === this.DELETE_CONFIRM_PHRASE;
  }

  get editDesignations() {
    if (!this.editMember?.departmentId) return [];
    return this.globalState.designations().filter(
      d => d.departmentId === this.editMember!.departmentId
    );
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



  openEditModal(member: TeamMember): void {
    this.editMember = { ...member };
    this.originalEditMember = { ...member };
    this.editImagePreview.set(member.profileImage ?? null);
    this.editFormError.set('');
    this.showEditModal.set(true);
    this.showProfileModal.set(false);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editMember = null;
    this.originalEditMember = null; // ADD THIS
    this.editImagePreview.set(null);
    this.editFormError.set('');
  }

  onEditProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.editMember) return;

    if (!file.type.startsWith('image/')) {
      this.editFormError.set('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.editImagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
    // this.editMember!.profileImage = file;

  }

  removeEditProfileImage(): void {
    if (!this.editMember) return;
    this.editMember.profileImage = "null";
    this.editImagePreview.set(null);
  }

  validateEditForm(): boolean {
    if (!this.editMember) return false;
    if (!this.editMember.name.trim()) {
      this.editFormError.set('Name is required.');
      return false;
    }
    if (!this.editMember.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.editMember.email)) {
      this.editFormError.set('A valid email is required.');
      return false;
    }
    if (!this.editMember.departmentId) {
      this.editFormError.set('Department is required.');
      return false;
    }
    if (!this.editMember.designationId) {
      this.editFormError.set('Designation is required.');
      return false;
    }
    if (!this.editMember.accessLevelId) {
      this.editFormError.set('Access level is required.');
      return false;
    }
    return true;
  }

  handleEditMember(): void {
    this.editFormError.set('');
    if (!this.validateEditForm() || !this.editMember || !this.originalEditMember) return;

    const current = this.editMember;
    const original = this.originalEditMember;

    const payload: Partial<UpdateTeamMemberDto> = {};

    if (current.name !== original.name) payload.name = current.name;
    if (current.email !== original.email) payload.email = current.email;
    if (current.employeeId !== original.employeeId) payload.employeeId = current.employeeId;
    if (current.departmentId !== original.departmentId) payload.departmentId = current.departmentId;
    if (current.designationId !== original.designationId) payload.designationId = current.designationId;
    if (current.accessLevelId !== original.accessLevelId) payload.accessLevelId = current.accessLevelId;
    if (current.profileImage !== original.profileImage) {
      payload.profileImage = current.profileImage ?? undefined;
    }

    if (Object.keys(payload).length === 0) {
      this.closeEditModal();
      return;
    }

    this.isSubmittingEdit.set(true);
    this.teamService.handleUpdateTeamMember(this.editMember.id!, payload).subscribe({
      next: () => {
        this.isSubmittingEdit.set(false);
        this.toast.success(`${this.editMember!.name}'s details updated successfully!`);
        this.closeEditModal();
      },
      error: () => {
        this.isSubmittingEdit.set(false);
        this.toast.error('Failed to update team member!');
        this.editFormError.set('Failed to update member. Please try again.');
      },
    });
  }

  // --- DELETE MEMBER ---

  openDeleteModal(member: TeamMember, event: Event): void {
    event.stopPropagation();
    this.showProfileModal.set(false);
    this.memberToDelete.set(member);
    this.deleteConfirmText.set('');
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.memberToDelete.set(null);
    this.deleteConfirmText.set('');
  }

  onDeleteConfirmInput(value: string): void {
    this.deleteConfirmText.set(value);
  }

  confirmDeleteMember(): void {
    const member = this.memberToDelete();
    if (!member || !this.isDeleteConfirmed) return;

    this.isDeletingMember.set(true);
    this.teamService.handleDeleteTeamMember(member.id).subscribe({
      next: () => {
        this.isDeletingMember.set(false);
        this.toast.success(`${member.name} has been removed.`);
        this.closeDeleteModal();
        this.showProfileModal.set(false); // in case delete was triggered from profile modal
      },
      error: () => {
        this.isDeletingMember.set(false);
        this.toast.error('Failed to remove team member!');
      },
    });
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
      employeeId: '',
      departmentId: '',
      designationId: '',
      accessLevelId: '',
      profileImage: null,
    };
    this.imagePreview.set(null);
    this.formError.set('');
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.formError.set('');
    this.imagePreview.set(null);
  }

  openProfile(member: TeamMember): void {
    this.selectedMember.set(member);
    this.showProfileModal.set(true);
  }

  closeProfile(): void {
    this.showProfileModal.set(false);
    this.selectedMember.set(null);
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.formError.set('Please select a valid image file.');
      return;
    }

    // Keep the raw File for upload
    this.newMember.profileImage = file;

    // Generate a preview only (not sent to backend)
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeProfileImage(): void {
    this.imagePreview.set(null);
    this.newMember.profileImage = null;
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
    if (!this.newMember.employeeId.trim()) {
      this.formError.set('Employee ID is required.');
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