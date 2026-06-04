import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Input() isSidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  readonly themeService = inject(ThemeService);
  private authService = inject(AuthService);


  get isDarkTheme() {
    return this.themeService.isDark();
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}