import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
   @Output() toggleSidebar = new EventEmitter<void>();

   constructor(private authService: AuthService) { }

   logout(): void {
      this.authService.logout();
   }
}
