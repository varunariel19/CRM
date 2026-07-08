import { Injectable, signal, computed } from '@angular/core';
import { DepartmentKey } from '../core/constants/global';

export interface PermissionItem {
    id: string;
    code: string;
    description: string;
}

export interface AccessLevelItem {
    id: string;
    name: string;
    access: number;
    permissions: { id: string; code: string; description: string }[];
}

export interface DepartmentItem {
    id: string;
    name: string;
    departmentKey: DepartmentKey;
}

export interface DesignationItem {
    id: string;
    name: string;
    departmentId: string;
}

@Injectable({ providedIn: 'root' })
export class GlobalState {
    private _permissions = signal<PermissionItem[]>([]);
    private _departments = signal<DepartmentItem[]>([]);
    private _accessLevels = signal<AccessLevelItem[]>([]);
    private _designations = signal<DesignationItem[]>([]);
    private _isLoading = signal(false);

    permissions = computed(() => this._permissions());
    departments = computed(() => this._departments());
    accessLevels = computed(() => this._accessLevels());
    designations = computed(() => this._designations());
    isLoading = computed(() => this._isLoading());


    readonly myViewOnly = signal<boolean>(true);
    readonly isOpen = signal<boolean>(false);

    open(): void {
        this.isOpen.set(true);
    }

    close(): void {
        this.isOpen.set(false);
    }

    toggleNotificationPanel(): void {
        this.isOpen.update(v => !v);
    }

    toggle(): void {
        this.myViewOnly.update(v => !v);
    }

    setPermissions(data: PermissionItem[]): void {
        this._permissions.set(data);
    }

    setDepartments(data: DepartmentItem[]): void {
        this._departments.set(data);
    }

    setAccessLevels(data: AccessLevelItem[]): void {
        this._accessLevels.set(data);
    }

    setDesignations(data: DesignationItem[]): void {
        this._designations.set(data);
    }

    setLoading(loading: boolean): void {
        this._isLoading.set(loading);
    }


    getDepartmentName(id: string) {
        return this.departments().find(d => d.id == id)?.name ?? "Unknown";
    }

    getDesignationName(id: string) {
        return this.designations().find(d => d.id == id)?.name ?? "Unknown";
    }



    clear(): void {
        this._permissions.set([]);
        this._departments.set([]);
        this._accessLevels.set([]);
        this._designations.set([]);
    }
}