import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RootComponent } from './core/layouts/root/root.component';
import { AuthGuard, GuestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },

  {
    path: 'sign-in',
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'dashboard',
    component: RootComponent,
    canActivate: [AuthGuard]

  },
  { path: 'dashboard/lead/:id', component: RootComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/projects/:id', component: RootComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/task-management/:id', component: RootComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/teams/:id', component: RootComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/:menu', component: RootComponent, canActivate: [AuthGuard] },
  {
    path: "main",
    redirectTo: 'dashboard',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
