import { Component } from '@angular/core';
import { SidebarComponent } from "../../../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../../../shared/header/header.component";
import { DashboardComponent } from '../../../layout/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, HeaderComponent, DashboardComponent],
  templateUrl: './root.component.html',
  styleUrl: './root.component.css',
})
export class RootComponent {

   isSidebarCollapsed = false;
}
