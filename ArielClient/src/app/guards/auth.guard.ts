import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Routes } from '../core/constants/endpoints';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    canActivate(): Observable<boolean | UrlTree> {
        return this.authService.validateUser().pipe(
            map((isVerified) => isVerified ? true : this.router.createUrlTree([Routes.signIn]))
        );
    }
}

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    canActivate(): Observable<boolean | UrlTree> {
        return this.authService.validateUser().pipe(
            map((isVerified) => isVerified ? this.router.createUrlTree([Routes.dashboard]) : true)
        );
    }
}
