import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryFilterDto, HistoryResponseDto, HistoryService } from '../../../core/services/history.service';

@Component({
  selector: 'app-audit-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-history.component.html',
  styleUrls: ['./audit-history.component.scss']
})

export class AuditHistoryComponent implements OnInit {

  logs: HistoryResponseDto[] = [];
  totalCount = 0;
  totalPages = 1;
  isLoading = false;

  filter: HistoryFilterDto = {
    page: 1,
    pageSize: 15
  };

  selectedLog: HistoryResponseDto | null = null;

  confirmModal = {
    visible: false,
    title: '',
    message: '',
    onConfirm: () => { }
  };

  constructor(private historyService: HistoryService) { }

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.historyService.getAll(this.filter).subscribe({
      next: (res) => {
        this.logs = res.items;
        this.totalCount = res.totalCount;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filter.page = 1;
    this.loadLogs();
  }

  resetFilters(): void {
    this.filter = { page: 1, pageSize: 15 };
    this.loadLogs();
  }

  changePage(page: number): void {
    this.filter.page = page;
    this.loadLogs();
  }

  openDetail(log: HistoryResponseDto): void {
    this.selectedLog = log;
  }

  closeDetail(): void {
    this.selectedLog = null;
  }

  confirmRevert(log: HistoryResponseDto): void {
    this.confirmModal = {
      visible: true,
      title: 'Revert Action',
      message: `Are you sure you want to revert "${log.title}"? This will undo the original action.`,
      onConfirm: () => this.revert(log.id)
    };
  }

  revert(id: string): void {
    this.cancelConfirm();
    this.historyService.revert(id).subscribe({
      next: () => this.loadLogs(),
      error: (err) => console.error('Revert failed', err)
    });
  }

  confirmDelete(id: string): void {
    this.confirmModal = {
      visible: true,
      title: 'Delete Log',
      message: 'Are you sure you want to delete this log entry? This cannot be undone.',
      onConfirm: () => this.deleteLog(id)
    };
  }

  deleteLog(id: string): void {
    this.cancelConfirm();
    this.historyService.delete(id).subscribe({
      next: () => this.loadLogs(),
      error: (err) => console.error('Delete failed', err)
    });
  }

  confirmDeleteAll(): void {
    this.confirmModal = {
      visible: true,
      title: 'Clear All Logs',
      message: 'This will permanently delete ALL audit logs. This action cannot be undone.',
      onConfirm: () => this.deleteAll()
    };
  }

  deleteAll(): void {
    this.cancelConfirm();
    this.historyService.deleteAll().subscribe({
      next: () => this.loadLogs(),
      error: (err) => console.error('Delete all failed', err)
    });
  }

  cancelConfirm(): void {
    this.confirmModal.visible = false;
  }

  formatJson(raw: string): string {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }

  getActionClass(action: string): string {
    switch (action?.toLowerCase()) {
      case 'create': return 'badge-create';
      case 'update': return 'badge-update';
      case 'delete': return 'badge-delete';
      default: return 'badge-default';
    }
  }

  getRevertClass(revert: string): string {
    return revert?.toLowerCase() === 'none' ? 'revert-none' : '';
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
