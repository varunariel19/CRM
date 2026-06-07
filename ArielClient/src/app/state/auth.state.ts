import { Injectable, signal, computed } from '@angular/core';
import { UserPayload } from '../core/types/auth.type';
import { TeamMember } from '../core/types/global.type';

@Injectable({ providedIn: 'root' })
export class AuthState {
    private _user = signal<UserPayload | null>(null);
    private _isValidating = signal(false);
    private _teamMembers = signal<TeamMember[]>([]);

    user = computed(() => this._user());
    isValidating = computed(() => this._isValidating());

    isLoggedIn = computed(() => this._user() !== null);
    fullName = computed(() => this._user()?.name ?? '');
    userId = computed(() => this._user()?.id ?? null);

    setUser(user: UserPayload | null): void {
        this._user.set(user);
    }

    setValidating(isValidating: boolean): void {
        this._isValidating.set(isValidating);
    }


    clear(): void {
        this._user.set(null);
        this._teamMembers.set([]);
    }
}