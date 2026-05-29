import { Injectable, signal, computed } from '@angular/core';
import { UserRes } from '../core/types/auth.type';
import { TeamMember } from '../core/types/global.type';

@Injectable({ providedIn: 'root' })
export class AuthState {
    private _user = signal<UserRes | null>(null);
    private _isValidating = signal(false);
    private _teamMembers = signal<TeamMember[]>([]);

    user = computed(() => this._user());
    isValidating = computed(() => this._isValidating());
    teamMembers = computed(() => this._teamMembers());

    isLoggedIn = computed(() => this._user() !== null);
    role = computed(() => this._user()?.role ?? null);
    fullName = computed(() => this._user()?.name ?? '');
    userId = computed(() => this._user()?.id ?? null);

    setUser(user: UserRes | null): void {
        this._user.set(user);
    }

    setValidating(isValidating: boolean): void {
        this._isValidating.set(isValidating);
    }

    setTeamMembers(members: TeamMember[]): void {
        this._teamMembers.set(members);
    }

    clear(): void {
        this._user.set(null);
        this._teamMembers.set([]);
    }
}