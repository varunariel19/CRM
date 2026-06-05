import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HistoryFilterDto, HistoryResponseDto, HistoryService } from '../../../core/services/history.service';
import { HistoryState } from '../../../state/history.state';

@Component({
  selector: 'app-audit-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-history.component.html',
  styleUrls: ['./audit-history.component.scss']
})
export class AuditHistoryComponent {

  historyState = inject(HistoryState);
  totalCount = 0;
  totalPages = 1;
  isLoading = false;

  filter: HistoryFilterDto = { page: 1, pageSize: 15 };

  selectedLogDiffHtml: SafeHtml = '';

  confirmModal = {
    visible: false,
    title: '',
    message: '',
    onConfirm: () => { }
  };

  constructor(
    private historyService: HistoryService,
    private sanitizer: DomSanitizer
  ) { }

  get logs() {
    return this.historyState.recentHistory();
  }

  get selectedLog()  {
     return this.historyState.selectedLog();
  }


  loadLogs(): void {
    this.isLoading = true;
    this.historyService.getAll(this.filter).subscribe({
      next: (res) => {
        this.historyState.setHistoryLogs(res.items);
        this.totalCount = res.totalCount;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
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
    this.historyState.setSelectedLog(log);
    const raw = this.renderDiff(log.previousState ?? null, log.modifiedData ?? null);
    this.selectedLogDiffHtml = this.sanitizer.bypassSecurityTrustHtml(raw);
  }

  closeDetail(): void {
    this.historyState.setSelectedLog(null);
    this.selectedLogDiffHtml = '';
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

  getActionClass(action: string): string {
    switch (action?.toLowerCase()) {
      case 'create': return 'action-create';
      case 'update': return 'action-update';
      case 'delete': return 'action-delete';
      default: return 'action-default';
    }
  }

  getRevertClass(revert: string): string {
    return revert?.toLowerCase() === 'none' ? 'revert-none' : '';
  }

  getChangedFieldCount(modifiedData: string | null): number {
    if (!modifiedData) return 0;
    try {
      return Object.keys(JSON.parse(modifiedData)).length;
    } catch {
      return 0;
    }
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  private renderDiff(previousJson: string | null, diffJson: string | null): string {
    if (!diffJson) return '';
    try {
      const prev = previousJson ? JSON.parse(previousJson) : {};
      const diff = JSON.parse(diffJson);
      const entries = Object.entries(diff);
      if (entries.length === 0) return '';

      const rows = entries.map(([key, newVal]) => {
        const oldVal = prev[key] !== undefined ? String(prev[key]) : null;
        const newStr = String(newVal);

        const oldCell = oldVal !== null
          ? `<span class="diff-old">${this.escHtml(oldVal)}</span>`
          : `<em class="diff-empty">not set</em>`;

        const newCell = `<span class="diff-new">${this.escHtml(newStr)}</span>`;

        return `
          <tr class="diff-row">
            <td class="diff-field">${this.escHtml(this.toLabel(key))}</td>
            <td class="diff-val">${oldCell}</td>
            <td class="diff-arrow">→</td>
            <td class="diff-val">${newCell}</td>
          </tr>`;
      }).join('');

      return `
        <table class="diff-table">
          <thead>
            <tr class="diff-head">
              <th>Field</th>
              <th>Previous</th>
              <th></th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    } catch {
      return '';
    }
  }

  private toLabel(key: string): string {
    return key.replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  private escHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}