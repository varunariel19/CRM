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
      .get<TeamMember[]>(endpoints.teamMembers)
      .pipe(tap(members => this.teamState.setTeamMembers(members)));
  }

  handleGetById(id: string): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${endpoints.teamMembers}/${id}`);
  }

  handleCreateTeamMember(dto: CreateTeamMemberDto): Observable<TeamMember> {
    return this.http
      .post<TeamMember>(`${endpoints.teamMembers}/register`, dto)
      .pipe(
        tap(member =>
          this.teamState.setTeamMembers([...this.teamState.teamMembers(), member])
        )
      );
  }

  handleUpdateTeamMember(id: string, dto: UpdateTeamMemberDto): Observable<TeamMember> {
    return this.http
      .put<TeamMember>(`${endpoints.teamMembers}/${id}`, dto)
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
      .delete<void>(`${endpoints.teamMembers}/${id}`)
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