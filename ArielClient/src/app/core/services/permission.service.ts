import { computed, inject, Injectable } from '@angular/core';
import { AuthState } from '../../state/auth.state';
import { PermissionCodeMap } from '../constants/permission';
import { PermissionKey } from '../constants/permission';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {

    private authState = inject(AuthState);

    readonly permissions = computed(() => {
        const user = this.authState.user();
        return new Set(
            user?.accessLevel?.permissions?.map(p => p.code) ?? []
        );
    });

    canManage(accessLevel: number) {
        const currentLevel = this.authState.user()?.accessLevel.access ?? 0;
        if (currentLevel > accessLevel) return true;
        return false;
    }

    has(permission: PermissionKey | string): boolean {
        const code = PermissionCodeMap[permission as PermissionKey] ?? permission;
        return this.permissions().has(code);
    }

    hasAny(...permissions: (PermissionKey | string)[]): boolean {
        return permissions.some(p => this.has(p));
    }

    hasAll(...permissions: (PermissionKey | string)[]): boolean {
        return permissions.every(p => this.has(p));
    }
}