import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, } from 'rxjs';
import { AuthState } from '../state/auth.state';
import { endpoints, } from '../core/constants/endpoints';
import { TeamMember } from '../core/types/global.type';


@Injectable({ providedIn: 'root' })
export class TeamService {

    constructor(
        private http: HttpClient,
        private router: Router,
        private authState: AuthState
    ) { }


    getTeamMembers(): Observable<TeamMember[]> {
        return this.http.get<TeamMember[]>(endpoints.teamMembers);
    }

}
