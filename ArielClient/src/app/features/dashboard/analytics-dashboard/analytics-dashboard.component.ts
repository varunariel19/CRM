import { Component, inject, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';

import { LeadState } from '../../../state/lead.state';
import { DealState } from '../../../state/deal.state';
import { TicketState } from '../../../state/tickets.state';
import { DEAL_STAGE } from '../../../core/types/deal.type';
import { CommonModule } from '@angular/common';
import { LeadSource } from '../../../core/types/lead.type';
import { MenuState } from '../../../state/menu.state';
import { TaskState } from '../../../state/task.state';
import { MeetingState } from '../../../state/meeting.state';
import { HistoryResponseDto, HistoryService } from '../../../core/services/history.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-analytics-dashboard',
  imports: [BaseChartDirective, CommonModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss',
})
export class AnalyticsDashboardComponent implements OnInit {

  leadState    = inject(LeadState);
  dealState    = inject(DealState);
  menuState    = inject(MenuState);
  ticketState  = inject(TicketState);
  taskState    = inject(TaskState);
  meetingState = inject(MeetingState);
  themeService = inject(ThemeService);

  barChartType: ChartType = 'bar';

  // ── Theme-aware helpers ──────────────────────────────────────
  private get gridColor(): string {
    return this.themeService.isDark()
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.08)';
  }

  private get tickColor(): string {
    return this.themeService.isDark() ? '#a0a0a0' : '#3a4a6b';
  }

  private get borderColor(): string {
    return this.themeService.isDark()
      ? 'rgba(255,255,255,0.10)'
      : 'rgba(0,0,0,0.10)';
  }

  // ── Bar chart options (getter — re-evaluates on every CD) ────
  get barChartOptions(): ChartConfiguration<'bar'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => `$${Number(context.raw).toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: this.tickColor
          },
          border: {
            color: this.borderColor
          }
        },
        y: {
          grid: {
            color: this.gridColor
          },
          ticks: {
            color: this.tickColor,
            callback: (value) => `$${value}`
          },
          border: {
            color: this.borderColor
          }
        }
      }
    };
  }

  // ── Doughnut chart options (getter) ──────────────────────────
  get doughnutChartOptions(): ChartOptions<'doughnut'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          display: false
        }
      }
    };
  }

  constructor(private historyService: HistoryService) { }

  ngOnInit(): void {
    this.loadRecentHistory();
  }

  // ── rest of your code unchanged below ───────────────────────

  get leads() {
    return this.leadState.leads();
  }

  get pendingTask() {
    return this.taskState.tasks().filter(task => task.status == 'Pending');
  }

  navigateMenuOptions(index: number) {
    this.menuState.setActiveMenu(index);
  }

  get upcomingMeetings() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextTwoDays = new Date(today);
    nextTwoDays.setDate(today.getDate() + 2);

    return this.meetingState.meetings()
      .filter(meeting => {
        const [year, month, day] = meeting.date.split('-').map(Number);
        const meetingDate = new Date(year, month - 1, day);
        return meetingDate >= today && meetingDate <= nextTwoDays;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  get totalLeads() {
    return this.leadState.leads().length;
  }

  get activeDeals(): number {
    return this.dealState.deals()
      .filter(deal =>
        deal.stage === DEAL_STAGE.PROPOSAL ||
        deal.stage === DEAL_STAGE.NEGOTIATION
      ).length;
  }

  get wonRevenue(): number {
    return this.dealState.deals()
      .filter(deal => deal.stage === DEAL_STAGE.WON)
      .reduce((total, deal) => total + deal.value, 0);
  }

  get openTickets() {
    return this.ticketState.tickets()
      .filter(ticket => ticket.status === 'Open').length;
  }

  get dealStageData() {
    const deals = this.dealState.deals();
    return [
      { name: 'Proposal',    value: deals.filter(x => x.stage === DEAL_STAGE.PROPOSAL).reduce((sum, x) => sum + x.value, 0) },
      { name: 'Negotiation', value: deals.filter(x => x.stage === DEAL_STAGE.NEGOTIATION).reduce((sum, x) => sum + x.value, 0) },
      { name: 'Won',         value: deals.filter(x => x.stage === DEAL_STAGE.WON).reduce((sum, x) => sum + x.value, 0) },
      { name: 'Lost',        value: deals.filter(x => x.stage === DEAL_STAGE.LOST).reduce((sum, x) => sum + x.value, 0) }
    ];
  }

  get barChartData(): ChartData<'bar'> {
    return {
      labels: this.dealStageData.map(x => x.name),
      datasets: [{
        data: this.dealStageData.map(x => x.value),
        backgroundColor: '#206ce8',
        borderRadius: 4,
        barThickness: 40
      }]
    };
  }

  get leadSourceData() {
    const leads = this.leadState.leads();
    const countBySource = (source: LeadSource) =>
      leads.filter(x => x.source === source).length;

    return {
      website:   countBySource('Website'),
      referral:  countBySource('Referral'),
      instagram: countBySource('Instagram'),
      coldCall:  countBySource('ColdCall'),
      linkedIn:  countBySource('LinkedIn')
    };
  }

  get doughnutChartData(): ChartData<'doughnut'> {
    const data = this.leadSourceData;
    return {
      labels: ['Website', 'Referral', 'Instagram', 'Cold Call', 'LinkedIn'],
      datasets: [{
        data: [data.website, data.referral, data.instagram, data.coldCall, data.linkedIn],
        backgroundColor: ['#206ce8', '#7c3aed', '#f97316', '#ef4444', '#38bdf8'],
        borderWidth: 0
      }]
    };
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  recentHistory: HistoryResponseDto[] = [];
  isLoadingHistory = false;

  loadRecentHistory(): void {
    this.isLoadingHistory = true;
    this.historyService.getAll({ page: 1, pageSize: 10 }).subscribe({
      next: (res) => {
        this.recentHistory = res.items;
        this.isLoadingHistory = false;
      },
      error: () => {
        this.isLoadingHistory = false;
      }
    });
  }

  getActionClass(actionType: string): string {
    switch (actionType.toLowerCase()) {
      case 'create': return 'action-create';
      case 'update': return 'action-update';
      case 'delete': return 'action-delete';
      default:       return 'action-default';
    }
  }
}