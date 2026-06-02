import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { TeamMember, UserRole } from '../../../core/types/global.type';
import { FILTER_TABS, ROLE_COLORS, ROLE_LABELS, ROLES } from '../../../core/constants/user';
import { AuthState } from '../../../state/auth.state';


@Component({
  selector: 'app-team-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-members.component.html',
  styleUrl: './team-members.component.css',
})
export class TeamMembersComponent {

  authService = inject(AuthService);
  authState = inject(AuthState);

  showModal = false;

  members: TeamMember[] = this.authState.teamMembers() ?? [];

  filterRole = signal<UserRole | 'All'>('All');

  searchQuery = '';

  roles = ROLES;

  filterTabs = FILTER_TABS;

  roleLabels = ROLE_LABELS;

  roleColors = ROLE_COLORS;

  newMember = {
    name: '',
    email: '',
    role: 'BDE' as UserRole,
  };

  formError = '';

  formSuccess = '';

  get filteredMembers(): TeamMember[] {
    return this.members.filter(m => {

      const matchRole =
        this.filterRole() === 'All' ||
        m.role === this.filterRole();

      const q = this.searchQuery.toLowerCase();

      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q);

      return matchRole && matchSearch;
    });
  }

  get groupedMembers(): Record<string, TeamMember[]> {

    const groups: Record<string, TeamMember[]> = {};

    for (const role of this.roles) {

      const list = this.filteredMembers.filter(
        m => m.role === role
      );

      if (list.length) {
        groups[role] = list;
      }
    }

    return groups;
  }

  get groupedKeys(): UserRole[] {
    return Object.keys(this.groupedMembers) as UserRole[];
  }

  countByRole(role: UserRole | 'All'): number {

    if (role === 'All') {
      return this.members.length;
    }

    return this.members.filter(
      m => m.role === role
    ).length;
  }

  setFilter(role: UserRole | 'All'): void {
    this.filterRole.set(role);
  }

  openModal(): void {

    this.newMember = {
      name: '',
      email: '',
      role: 'BDE',
    };

    this.formError = '';
    this.formSuccess = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  addMember(): void {

    this.formError = '';
    this.formSuccess = '';

    if (
      !this.newMember.name ||
      !this.newMember.email
    ) {
      this.formError = 'Name and email are required.';
      return;
    }

    if (
      this.members.some(
        m => m.email === this.newMember.email
      )
    ) {
      this.formError = 'A member with this email already exists.';
      return;
    }

    const payload = {
      name: this.newMember.name,
      email: this.newMember.email,
      role: this.newMember.role,
    };

    this.authService
      .registerTeamMember(payload)
      .subscribe({
        next: (res: any) => {
          this.members.push({
            id: res.id ?? Date.now().toString(),
            name: this.newMember.name,
            email: this.newMember.email,
            role: this.newMember.role,
            createdAt: new Date()
              .toISOString()
              .slice(0, 10),
          });

          this.formSuccess =
            `${this.newMember.name} added successfully.`;

          setTimeout(() => {
            this.closeModal();
          }, 1200);
        },

        error: (err) => {
          this.formError =
            err?.error?.message ||
            'Failed to create team member.';
        }
      });
  }

  removeMember(id: string): void {
    this.members = this.members.filter(
      m => m.id !== id
    );
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

}