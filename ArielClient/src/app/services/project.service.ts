import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../core/constants/endpoints';
import { Project, ProjectDocument } from '../features/dashboard/projects/projects.component';


@Injectable({
    providedIn: 'root'
})
export class ProjectService {

    private readonly http = inject(HttpClient);

    createProject(formData: FormData): Observable<any> {
        return this.http.post(`${endpoints.projects}`, formData, { withCredentials: true });
    }

    createProjectForLead(payload: {
        leadId: string;
        projectTitle: string;
        projectType?: string | null;
        budget?: number | null;
        dealStartDate?: string | null;
        dealCloseDate?: string | null;
    }): Observable<any> {
        return this.http.post(`${endpoints.projects}/for-lead`, payload, { withCredentials: true });
    }

    updateProject(projectId: string, payload: FormData): Observable<any> {
        return this.http.put(
            `${endpoints.projects}/${projectId}`,
            payload, { withCredentials: true }
        );
    }


    addMemberToProject(projectId: string, memberId: string) {
        const params = new HttpParams()
            .set('projectId', projectId)
            .set('memberId', memberId);

        return this.http.patch(`${endpoints.projects}/add-member`, {}, { params, withCredentials: true });
    }

    removeMemberFromProject(projectId: string, memberId: string) {
        const params = new HttpParams()
            .set('projectId', projectId)
            .set('memberId', memberId);

        return this.http.patch(`${endpoints.projects}/remove-member`, {}, { params, withCredentials: true });
    }

    deleteProject(projectId: string): Observable<any> {
        return this.http.delete(
            `${endpoints.projects}/${projectId}`
        );
    }

    removeDocumentFromProject(documentId : string) {
         return this.http.delete(`${endpoints.projects}/remove-document/${documentId}` , {withCredentials : true});
    }

   uploadDocuments(projectId: string, formData: FormData) {
    return this.http.post<ProjectDocument[]>(`${endpoints.projects}/add-document/${projectId}`, formData, { withCredentials: true });
}

    fetchAllProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(
            endpoints.projects, { withCredentials: true }
        );
    }
}
