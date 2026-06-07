import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../constants/endpoints';
import { AccessLevelItem, DepartmentItem, DesignationItem, PermissionItem } from '../../state/global.state';

@Injectable({ providedIn: 'root' })
export class LookUpService {
    private http = inject(HttpClient);

    // GET
    getPermissions(): Observable<PermissionItem[]> {
        return this.http.get<PermissionItem[]>(endpoints.PERMISSIONS, { withCredentials: true });
    }

    getDepartments(): Observable<DepartmentItem[]> {
        return this.http.get<DepartmentItem[]>(endpoints.DEPARTMENTS, { withCredentials: true });
    }

    getAccessLevels(): Observable<AccessLevelItem[]> {
        return this.http.get<AccessLevelItem[]>(endpoints.ACCESS_LEVELS, { withCredentials: true });
    }

    getDesignations(): Observable<DesignationItem[]> {
        return this.http.get<DesignationItem[]>(endpoints.DESIGNATIONS, { withCredentials: true });
    }

    // DEPARTMENTS
    addDepartment(name: string): Observable<DepartmentItem> {
        return this.http.post<DepartmentItem>(endpoints.DEPARTMENTS, { name }, { withCredentials: true });
    }

    updateDepartment(id: string, name: string): Observable<DepartmentItem> {
        return this.http.put<DepartmentItem>(`${endpoints.DEPARTMENTS}/${id}`, { name }, { withCredentials: true });
    }

    deleteDepartment(id: string): Observable<any> {
        return this.http.delete(`${endpoints.DEPARTMENTS}/${id}`, { withCredentials: true });
    }

    // DESIGNATIONS
    addDesignation(name: string, departmentId: string): Observable<DesignationItem> {
        return this.http.post<DesignationItem>(endpoints.DESIGNATIONS, { name, departmentId }, { withCredentials: true });
    }

    updateDesignation(id: string, name: string): Observable<DesignationItem> {
        return this.http.put<DesignationItem>(`${endpoints.DESIGNATIONS}/${id}`, { name }, { withCredentials: true });
    }

    deleteDesignation(id: string): Observable<any> {
        return this.http.delete(`${endpoints.DESIGNATIONS}/${id}`, { withCredentials: true });
    }

    // ACCESS LEVEL PERMISSIONS
    updateAccessLevelPermissions(id: string, permissionIds: string[]): Observable<any> {
        return this.http.put(`${endpoints.ACCESS_LEVELS}/${id}/permissions`, { permissionIds }, { withCredentials: true });
    }
}
