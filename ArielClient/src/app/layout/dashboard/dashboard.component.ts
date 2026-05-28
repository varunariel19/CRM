import { Component, inject } from '@angular/core';
import { AnalyticsDashboardComponent } from "../../features/dashboard/analytics-dashboard/analytics-dashboard.component";
import { MenuState } from '../../state/menu.state';
import { CommonModule } from '@angular/common';
import { LeadManagementComponent } from "../../features/dashboard/lead-mangement/lead-mangement.component";
import { CustomerProfilesComponent } from "../../features/dashboard/customer-profiles/customer-profiles.component";
import { DealsPipelineComponent } from "../../features/dashboard/deals-pipeline/deals-pipeline.component";
import { TasksFollowupsComponent } from "../../features/dashboard/task-follow-up/task-follow-up.component";
import { CustomerTicketsComponent } from "../../features/dashboard/customer-tickets/customer-tickets.component";
import { AppointmentSchedulerComponent } from "../../features/dashboard/appointment-scheduler/appointment-scheduler.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AnalyticsDashboardComponent,
    LeadManagementComponent,
    CustomerProfilesComponent,
    DealsPipelineComponent,
    TasksFollowupsComponent,
    CustomerTicketsComponent,
    AppointmentSchedulerComponent
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})




export class DashboardComponent {

  menuState = inject(MenuState);

  selectedMenu = this.menuState.selectedMenu;

}