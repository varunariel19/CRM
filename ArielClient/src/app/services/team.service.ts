import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable } from 'rxjs';

import { endpoints } from '../core/constants/endpoints';
import { CreateTeamMemberDto, TeamMember, UpdateTeamMemberDto } from '../core/types/global.type';
import { TeamState } from '../state/team.state';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private teamState = inject(TeamState);

  constructor(private http: HttpClient) { }

  handleGetList(): Observable<TeamMember[]> {
    return this.http
      .get<TeamMember[]>(endpoints.teamMembers, { withCredentials: true })
      .pipe(tap(members => this.teamState.setTeamMembers(members)));
  }

  handleGetById(id: string): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${endpoints.teamMembers}/${id}`, { withCredentials: true });
  }

  handleCreateTeamMember(dto: CreateTeamMemberDto): Observable<TeamMember> {
    const formData = new FormData();
    formData.append('name', dto.name);
    formData.append('email', dto.email);
    formData.append('employeeId', dto.employeeId);
    formData.append('departmentId', dto.departmentId);
    formData.append('designationId', dto.designationId);
    formData.append('accessLevelId', dto.accessLevelId);

    if (dto.profileImage) {
      formData.append('profileImage', dto.profileImage, dto.profileImage.name);
    }

    return this.http
      .post<TeamMember>(`${endpoints.teamMembers}/register`, formData, { withCredentials: true })
      .pipe(
        tap(member =>
          this.teamState.setTeamMembers([...this.teamState.teamMembers(), member])
        )
      );
  }

  handleUpdateTeamMember(id: string, dto: Partial<UpdateTeamMemberDto>): Observable<TeamMember> {
    return this.http
      .put<TeamMember>(`${endpoints.teamMembers}/${id}`, dto, { withCredentials: true })
      .pipe(
        tap(updatedMember => {
          const updated = this.teamState
            .teamMembers()
            .map(member => (member.id === id ? updatedMember : member));

          this.teamState.setTeamMembers(updated);
        })
      );
  }

  handleDeleteTeamMember(id: string): Observable<void> {
    return this.http
      .delete<void>(`${endpoints.teamMembers}/${id}`, { withCredentials: true })
      .pipe(
        tap(() => {
          const updated = this.teamState
            .teamMembers()
            .filter(member => member.id !== id);

          this.teamState.setTeamMembers(updated);
        })
      );
  }
}