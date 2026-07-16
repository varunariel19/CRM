import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, from, map, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthState } from '../state/auth.state';
import { Routes } from '../core/constants/endpoints';
import { E2eKeyService } from '../core/services/E2eKey.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private authService: AuthService,
        private authState: AuthState,
        private e2eKeyService: E2eKeyService,
    ) { }

    canActivate(): Observable<boolean | UrlTree> {
        if (this.e2eKeyService.getPrivateKey()) {
            return this.authService.validateUser().pipe(
                map((isVerified) => isVerified ? true : this.router.createUrlTree([Routes.signIn]))
            );
        }

        return this.authService.validateUser().pipe(
            switchMap((isVerified) => {
                if (!isVerified) {
                    return from(Promise.resolve(this.router.createUrlTree([Routes.signIn])));
                }

                const user = this.authState.user();

                if (!user) {
                    return from(Promise.resolve(this.router.createUrlTree([Routes.signIn])));
                }

                return from(this.e2eKeyService.tryRestoreFromIndexedDb(user.id)).pipe(
                    map((restored) =>
                        restored
                            ? true
                            : this.router.createUrlTree(['/unlock-key'], {
                                queryParams: { returnUrl: this.router.url },
                            })
                    )
                );
            })
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