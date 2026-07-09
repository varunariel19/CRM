import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { SettingsComponent } from "../../components/settings/settings.component";
import { ProfileSectionComponent } from '../../components/profile-section/profile-section.component';
import { AuthState } from '../../state/auth.state';
import { CommonModule } from '@angular/common';
import { PermissionFacade } from '../../core/services/permissionFacade.service';
import { GlobalState } from '../../state/global.state';
import {  NotificationState } from '../../state/notification.state';
import { UserProfileComponent } from "../../components/items/user-profile/user-profile.component";
@Component({
  selector: 'app-header',
  imports: [CommonModule, SettingsComponent, ProfileSectionComponent, UserProfileComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent  {
  @Input() isSidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  showSettings = signal(false);
  showProfile = signal(false);

  private authState = inject(AuthState);
  globalState = inject(GlobalState);
  notificationState = inject(NotificationState);
  perm = inject(PermissionFacade);

  readonly themeService = inject(ThemeService);
  private authService = inject(AuthService);




  get LogoUrl() {
    return this.authState.logoUrl();
  }

  get isDarkTheme() {
    return this.themeService.isDark();
  }

  get userDetails() {
    return this.authState.user();
  }




  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}