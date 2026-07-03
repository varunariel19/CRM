import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { SettingsComponent } from "../../components/settings/settings.component";
import { ProfileSectionComponent } from '../../components/profile-section/profile-section.component';
import { AuthState } from '../../state/auth.state';
import { CommonModule } from '@angular/common';
import { getAvatarColor } from '../../utils';
import { PermissionFacade } from '../../core/services/permissionFacade.service';
import { GlobalState } from '../../state/global.state';
import { DUMMY_NOTIFICATIONS, NotificationState } from '../../state/notification.state';
@Component({
  selector: 'app-header',
  imports: [CommonModule, SettingsComponent, ProfileSectionComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
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


  ngOnInit(): void {
    // this.notificationState.setAll(DUMMY_NOTIFICATIONS);
  }

  get LogoUrl() {
    return this.authState.logoUrl();
  }

  get isDarkTheme() {
    return this.themeService.isDark();
  }

  get userDetails() {
    return this.authState.user() ?? null;
  }


  getProfileColor(name: string) {
    return getAvatarColor(name);
  }



  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}