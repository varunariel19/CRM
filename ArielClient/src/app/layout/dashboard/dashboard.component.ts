import { afterNextRender, Component, effect, ElementRef, inject, Injector, OnInit, ViewChild } from '@angular/core';
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

import { TeamService } from '../../services/team.service';
import { LeadService } from '../../services/lead.service';
import { ContactService } from '../../services/contact.service';
import { DealService } from '../../services/deal.service';

import { TeamMember } from '../../core/types/global.type';
import { Deal } from '../../core/types/deal.type';
import { LeadState } from '../../state/lead.state';
import { ContactState } from '../../state/contact.state';
import { DealState } from '../../state/deal.state';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../core/types/ticket.type';
import { TicketState } from '../../state/tickets.state';
import { CrmTaskService } from '../../services/crm-task.service';
import { TaskState } from '../../state/task.state';
import { MeetingService } from '../../services/meeting.service';
import { MeetingState } from '../../state/meeting.state';
import { AuditHistoryComponent } from '../../features/dashboard/audit-history/audit-history.component';
import { HistoryService } from '../../core/services/history.service';
import { HistoryState } from '../../state/history.state';
import { TaskManagementComponent } from '../../features/dashboard/task-management/task-management.component';
import { ProjectsComponent } from '../../features/dashboard/projects/projects.component';
import { GlobalState } from '../../state/global.state';
import { LookUpService } from '../../core/services/lookup.service';
import { TeamState } from '../../state/team.state';
import { menuItems } from '../../core/constants/menuItems';
import { LoaderService } from '../../core/services/loader.service';
import { TeamsComponent } from '../../features/dashboard/teams/teams.component';

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
    TeamMembersComponent,
    AuditHistoryComponent,
    TaskManagementComponent,
    ProjectsComponent,
    TeamsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private crmTaskService = inject(CrmTaskService);
  private readonly meetingState = inject(MeetingState);

  globalState = inject(GlobalState);
  loader = inject(LoaderService);
  lookupService = inject(LookUpService);
  contactState = inject(ContactState);
  menuState = inject(MenuState);
  leadState = inject(LeadState);
  dealState = inject(DealState);
  ticketState = inject(TicketState);
  taskState = inject(TaskState);
  historyState = inject(HistoryState);
  teamState = inject(TeamState);

  leadService = inject(LeadService);
  contactService = inject(ContactService);
  dealService = inject(DealService);
  ticketService = inject(TicketService);
  meetingService = inject(MeetingService);
  historyService = inject(HistoryService);

  selectedMenu = this.menuState.selectedMenu;

  teamMemberList: TeamMember[] = [];


  constructor(private teamService: TeamService) {
  }


  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {

    this.lookupService.getDepartments().subscribe(data => this.globalState.setDepartments(data));
    this.lookupService.getDesignations().subscribe(data => this.globalState.setDesignations(data));
    this.lookupService.getAccessLevels().subscribe(data => this.globalState.setAccessLevels(data));
    this.lookupService.getPermissions().subscribe(data => this.globalState.setPermissions(data));

    this.teamService.handleGetList().subscribe({
      next: (data) => {
        this.teamState.setTeamMembers(data);
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

    this.crmTaskService.getAll().subscribe({
      next: (tasks) => {
        this.taskState.setTasks(tasks);
      },

    });

    this.meetingService.getAllMeetings().subscribe({
      next: (meetings) => {
        this.meetingState.setMeetings(meetings);
      },
    });

    this.historyState.setLoading(true);
    this.historyService.getAll({ page: 1, pageSize: 10 }).subscribe({
      next: (res) => {
        this.historyState.setLoading(false);
        this.historyState.setHistoryLogs(res.items);
      },

    });
  }


  goToPreviousMenu() {
    const history = this.menuState.menuHistory();

    if (history.length === 0) {
      this.menuState.setActiveMenu(0);
      return;
    }

    const previousMenu = history[history.length - 2] ?? 0;

    this.menuState.popHistory();
    this.menuState.setActiveMenu(previousMenu);
  }


  refresh() {
    const item = menuItems[this.menuState.activeIndex() ?? 0];
    this.loader.show("reloading...", 'lg');
    setTimeout(() => {
      
    switch (item.route) {
      case "leads": {
        this.leadService.handleGetLeads().subscribe({
          next: (leads) => {
            this.leadState.setLeads(leads);
          },
          error: (err) => {
            console.error('Failed to load leads', err);
          }
        });
        break;
      }

      default: {
        this.loader.hide();
        return;
      };
    }

    this.loader.hide();
     }, 500);
  }



}