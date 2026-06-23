import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { AuthState } from '../state/auth.state';
import { endpoints, Routes } from '../core/constants/endpoints';
import { LoginPayload, UserPayload } from '../core/types/auth.type';

interface LoginResponse {
    message: string;
    user: UserPayload;
}


@Injectable({ providedIn: 'root' })
export class AuthService {

    constructor(
        private http: HttpClient,
        private router: Router,
        private authState: AuthState,
    ) { }

    login(payload: LoginPayload): Observable<UserPayload> {
        return this.http
            .post<LoginResponse>(endpoints.login, payload, { withCredentials: true })
            .pipe(map((response) => response.user));
    }

    logout(): void {
        this.http.post<void>(endpoints.logout, {}, {
            withCredentials: true
        }).subscribe({
            next: () => {
                this.authState.clear();
                this.router.navigate([Routes.signIn]);
            }
        });
    }

    me(): void {
        this.validateUser().subscribe((isVerified) => {
            this.router.navigate([isVerified ? Routes.dashboard : Routes.signIn]);
        });
    }

    validateUser(): Observable<boolean> {
        this.authState.setValidating(true);

        return this.http.get<UserPayload>(endpoints.authenticate, {
            withCredentials: true
        }).pipe(
            map((response) => response ? response : null),
            tap((user) => {
                if (!user) {
                    this.authState.clear();
                    return;
                }
                this.authState.setUser(user);
            }),
            map((user) => !!user),
            catchError(() => {
                this.authState.clear();
                return of(false);
            }),
            finalize(() => this.authState.setValidating(false))
        );
    }

    private resolveError(err: HttpErrorResponse): string {
        if (err.status === 401) return 'Invalid email or password.';
        if (err.status === 0) return 'Cannot reach the server.';
        return err.error?.message ?? 'An unexpected error occurred.';
    }
}
