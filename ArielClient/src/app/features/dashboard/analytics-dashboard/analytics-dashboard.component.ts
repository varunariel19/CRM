import { Component, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';

import { LeadState } from '../../../state/lead.state';
import { DealState } from '../../../state/deal.state';
import { TicketState } from '../../../state/tickets.state';
import { CommonModule } from '@angular/common';
import { LeadSource, LeadStatusType } from '../../../core/types/lead.type';
import { MenuState } from '../../../state/menu.state';
import { TaskState } from '../../../state/task.state';
import { MeetingState } from '../../../state/meeting.state';
import { ThemeService } from '../../../core/services/theme.service';
import { HistoryState } from '../../../state/history.state';
import { PermissionFacade } from '../../../core/services/permissionFacade.service';

@Component({
  selector: 'app-analytics-dashboard',
  imports: [BaseChartDirective, CommonModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss',
})
export class AnalyticsDashboardComponent {

  leadState = inject(LeadState);
  dealState = inject(DealState);
  menuState = inject(MenuState);
  ticketState = inject(TicketState);
  taskState = inject(TaskState);
  meetingState = inject(MeetingState);
  themeService = inject(ThemeService);
  historyState = inject(HistoryState);
  perm = inject(PermissionFacade);

  barChartType: ChartType = 'bar';

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

  get barChartOptions(): ChartConfiguration<'bar'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${Number(context.raw)} leads`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: this.tickColor },
          border: { color: this.borderColor }
        },
        y: {
          grid: { color: this.gridColor },
          ticks: {
            color: this.tickColor,
            stepSize: 1,
            callback: (value) => `${value}`
          },
          border: { color: this.borderColor }
        }
      }
    };
  }

  get doughnutChartOptions(): ChartOptions<'doughnut'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: { display: false }
      }
    };
  }

  get leads() {
    return this.leadState.leads();
  }

  get pendingTask() {
    return this.taskState.tasks().filter(task => task.status === 'Pending');
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

  // ── Lead KPI helpers ──────────────────────────────────────────────────────

  get totalLeads(): number {
    return this.leads.length;
  }

  get newLeadsThisMonth(): number {
    const now = new Date();
    return this.leads.filter(lead => {
      const created = new Date(lead.createdAt);
      return created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth();
    }).length;
  }

  get qualifiedLeads(): number {
    return this.leads.filter(l => l.status === LeadStatusType.Qualified).length;
  }

  get convertedLeads(): number {
    return this.leads.filter(l => l.status === LeadStatusType.Converted).length;
  }

  get lostLeads(): number {
    return this.leads.filter(l => l.status === LeadStatusType.Lost).length;
  }

  get conversionRate(): string {
    if (this.totalLeads === 0) return '0.0';
    return ((this.convertedLeads / this.totalLeads) * 100).toFixed(1);
  }

  /** Average age of all leads in days (createdAt → today) */
  get averageLeadAge(): number {
    if (this.leads.length === 0) return 0;
    const now = Date.now();
    const totalDays = this.leads.reduce((sum, lead) => {
      const created = new Date(lead.createdAt).getTime();
      return sum + (now - created) / (1000 * 60 * 60 * 24);
    }, 0);
    return Math.round(totalDays / this.leads.length);
  }

  /** Avg days from creation to dealStartDate for leads that have one (proxy for response time) */
  get averageResponseTime(): number {
    const responded = this.leads.filter(l => l.dealStartDate && l.createdAt);
    if (responded.length === 0) return 0;
    const totalDays = responded.reduce((sum, lead) => {
      const created = new Date(lead.createdAt).getTime();
      const started = new Date(lead.dealStartDate).getTime();
      const diff = (started - created) / (1000 * 60 * 60 * 24);
      return sum + Math.max(0, diff);
    }, 0);
    return Math.round(totalDays / responded.length);
  }

  get revenueFromConverted(): number {
    return this.leads
      .filter(l => l.status === LeadStatusType.Converted)
      .reduce((sum, l) => sum + (l.budget ?? 0), 0);
  }

  get openTickets(): number {
    return this.ticketState.tickets().filter(t => t.status === 'Open').length;
  }

  // ── Chart data ────────────────────────────────────────────────────────────

  get leadStatusBarData(): ChartData<'bar'> {
    const statuses = [
      { label: 'Contacted', status: LeadStatusType.Contracted },
      { label: 'Qualified', status: LeadStatusType.Qualified },
      { label: 'Converted', status: LeadStatusType.Converted },
      { label: 'Lost', status: LeadStatusType.Lost },
    ];

    return {
      labels: statuses.map(s => s.label),
      datasets: [{
        data: statuses.map(s => this.leads.filter(l => l.status === s.status).length),
        backgroundColor: ['#206ce8', '#7c3aed', '#15803d', '#0ea5e9', '#ef4444'],
        borderRadius: 4,
        barThickness: 40
      }]
    };
  }

  get leadSourceData() {
    const leads = this.leads;

    const countBySource = (source: LeadSource) =>
      leads.filter(x => x.source === source).length;

    return {
      marketingPlatform: countBySource('MarketingPlatform'),
      website: countBySource('Website'),
      referrals: countBySource('Referrals'),
      linkedIn: countBySource('LinkedIn'),
      events: countBySource('Events'),
      partners: countBySource('Partners'),
      coldOutreach: countBySource('ColdOutreach')
    };
  }

  get doughnutChartData(): ChartData<'doughnut'> {
    const d = this.leadSourceData;

    return {
      labels: ['Marketing Platform', 'Website', 'Referrals', 'LinkedIn', 'Events', 'Partners', 'Cold Outreach'],
      datasets: [{
        data: [d.marketingPlatform, d.website, d.referrals, d.linkedIn, d.events, d.partners, d.coldOutreach],
        backgroundColor: ['#206ce8', '#7c3aed', '#f97316', '#38bdf8', '#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }]
    };
  }

  get recentHistory() {
    return this.historyState.recentHistory() ?? [];
  }

  formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  getActionClass(actionType: string): string {
    switch (actionType.toLowerCase()) {
      case 'create': return 'action-create';
      case 'update': return 'action-update';
      case 'delete': return 'action-delete';
      default: return 'action-default';
    }
  }
}