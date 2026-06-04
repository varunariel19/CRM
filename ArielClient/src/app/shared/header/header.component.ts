import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
   @Output() toggleSidebar = new EventEmitter<void>();
   @Output() toggleTheme = new EventEmitter<void>();
   @Input() isDarkTheme = true;

   constructor(private authService: AuthService) { }

   logout(): void {
      this.authService.logout();
   }
}
