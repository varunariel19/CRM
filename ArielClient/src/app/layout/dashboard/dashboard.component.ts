import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalyticsDashboardComponent } from "../../features/dashboard/analytics-dashboard/analytics-dashboard.component";
import { LeadManagementComponent } from "../../features/dashboard/lead-mangement/lead-mangement.component";
import { CustomerProfilesComponent } from "../../features/dashboard/customer-profiles/customer-profiles.component";
import { DealsPipelineComponent } from "../../features/dashboard/deals-pipeline/deals-pipeline.component";
import { TasksFollowupsComponent } from "../../features/dashboard/task-follow-up/task-follow-up.component";
import { CustomerTicketsComponent } from "../../features/dashboard/customer-tickets/customer-tickets.component";
import { AppointmentSchedulerComponent } from "../../features/dashboard/appointment-scheduler/appointment-scheduler.component";
import { TeamMembersComponent } from "../../features/dashboard/team-members/team-members.component";

import { MenuState } from '../../state/menu.state';
import { AuthState } from '../../state/auth.state';

import { TeamService } from '../../services/team.service';
import { LeadService } from '../../services/lead.service';
import { ContactService } from '../../services/contact.service';
import { DealService } from '../../services/deal.service';

import { TeamMember } from '../../core/types/global.type';
import { Contact } from '../../core/types/contact.type';
import { Deal } from '../../core/types/deal.type';
import { LeadState } from '../../state/lead.state';
import { ContactState } from '../../state/contact.state';
import { DealState } from '../../state/deal.state';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../core/types/ticket.type';
import { TicketState } from '../../state/tickets.state';

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
    AppointmentSchedulerComponent,
    TeamMembersComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {

  contactState = inject(ContactState);
  menuState = inject(MenuState);
  leadState = inject(LeadState);
  dealState = inject(DealState);
  ticketState = inject(TicketState);

  leadService = inject(LeadService);
  contactService = inject(ContactService);
  dealService = inject(DealService);
  ticketService = inject(TicketService);

  selectedMenu = this.menuState.selectedMenu;

  teamMemberList: TeamMember[] = [];

  constructor(
    private teamService: TeamService,
    private authState: AuthState
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {

    this.teamService.getTeamMembers().subscribe({
      next: (data) => {
        this.authState.setTeamMembers(data);
      },
      error: (err) => {
        console.error('Failed to load team members', err);
      }
    });

    this.leadService.handleGetLeads().subscribe({
      next: (leads) => {
        this.leadState.setLeads(leads);
      },
      error: (err) => {
        console.error('Failed to load leads', err);
      }
    });

    this.contactService.getAllContacts().subscribe({
      next: (contacts) => {
        this.contactState.setContacts(contacts);
      },
      error: (err) => {
        console.error('Error fetching contacts', err);
      }
    });

    this.dealService.getAllDeals().subscribe({
      next: (deals: Deal[]) => {
        this.dealState.setDeals(deals);
      },
      error: (err: any) => {
        console.error('Failed to load deals', err);
      }
    });

    this.ticketService.getAllTickets().subscribe({
      next: (tickets: Ticket[]) => {
        this.ticketState.setTickets(tickets);
      },
      error: (err: any) => {
        console.error('Failed to load deals', err);
      }
    });
  }
}