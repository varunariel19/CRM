import { Component } from '@angular/core';
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { DashboardComponent } from '../../core/layouts/dashboard/dashboard.component';
import { HeaderComponent } from "../../shared/header/header.component";

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, DashboardComponent, HeaderComponent],
  templateUrl: './root.component.html',
  styleUrl: './root.component.css',
})
export class RootComponent {

isSidebarCollapsed = false;

toggleSidebar() {
  this.isSidebarCollapsed =
    !this.isSidebarCollapsed;
}
}
