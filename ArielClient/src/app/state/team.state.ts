import { Injectable, signal, computed } from '@angular/core';
import { TeamMember } from '../core/types/global.type';

@Injectable({ providedIn: 'root' })
export class TeamState {
  private _teamMembers = signal<TeamMember[]>([]);
  private _loading = signal<boolean>(false);
  private _selectedMember = signal<TeamMember | null>(null);

  teamMembers = computed(() => this._teamMembers());
  loading = computed(() => this._loading());
  selectedMember = computed(() => this._selectedMember());
  totalCount = computed(() => this._teamMembers().length);

  setTeamMembers(members: TeamMember[]): void {
    this._teamMembers.set(members);
  }

  setLoading(val: boolean): void {
    this._loading.set(val);
  }

  setSelectedMember(member: TeamMember | null): void {
    this._selectedMember.set(member);
  }

  clear(): void {
    this._teamMembers.set([]);
    this._selectedMember.set(null);
  }
}