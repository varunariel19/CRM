import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RootComponent } from './layout/root/root.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    component: LandingComponent,
  },
  {
    path: 'sign-in',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: RootComponent,
  },
  {
    path: "main",
    redirectTo: 'dashboard',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
