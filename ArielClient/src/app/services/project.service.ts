import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../core/constants/endpoints';
import { CreateProjectPayload } from '../features/dashboard/deals-pipeline/deals-pipeline.component';
import { Project } from '../state/task-management.state';


@Injectable({
    providedIn: 'root'
})
export class ProjectService {

    private readonly http = inject(HttpClient);

    createProject(formData: FormData): Observable<any> {
        return this.http.post(`${endpoints.projects}`, formData, { withCredentials: true });
    }

    updateProject(projectId: string, payload: FormData): Observable<any> {
        return this.http.put(
            `${endpoints.projects}/${projectId}`,
            payload
        );
    }


    addMemberToProject(projectId: string, memberId: string) {
        const params = new HttpParams()
            .set('projectId', projectId)
            .set('memberId', memberId);

        return this.http.patch(`${endpoints.projects}/add-member`, {}, { params });
    }

    removeMemberFromProject(projectId: string, memberId: string) {
        const params = new HttpParams()
            .set('projectId', projectId)
            .set('memberId', memberId);

        return this.http.patch(`${endpoints.projects}/remove-member`, {}, { params });
    }

    deleteProject(projectId: string): Observable<any> {
        return this.http.delete(
            `${endpoints.projects}/${projectId}`
        );
    }

    getProject(projectId: string): Observable<Project> {
        return this.http.get<Project>(
            `${endpoints.projects}/${projectId}`
        );
    }

    fetchAllProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(
            endpoints.projects
        );
    }
}