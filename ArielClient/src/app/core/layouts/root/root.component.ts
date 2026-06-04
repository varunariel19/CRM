import { Component } from '@angular/core';
import { SidebarComponent } from "../../../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../../../shared/header/header.component";
import { DashboardComponent } from '../../../layout/dashboard/dashboard.component';
import { ConfirmationModalComponent } from "../../../shared/modals/confirmation-modal/confirmation-modal.component";
import { GlobalLoaderComponent } from "../../../shared/global-loader/global-loader.component";

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, HeaderComponent, DashboardComponent, ConfirmationModalComponent, GlobalLoaderComponent],
  templateUrl: './root.component.html',
  styleUrl: './root.component.css',
})
export class RootComponent {
  isSidebarCollapsed = false;
}