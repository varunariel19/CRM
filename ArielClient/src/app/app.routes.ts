import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RootComponent } from './core/layouts/root/root.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
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
