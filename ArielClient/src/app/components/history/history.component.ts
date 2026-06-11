import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditHistoryStore } from '../../state/audit-history.state';
import { HistoryResponseDto } from '../../core/services/audit-history.service';

@Component({
  selector: 'app-audit-history-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./history.component.html",
  styleUrl: "./history.component.css"
})
export class AuditHistoryModalComponent {

  store = inject(AuditHistoryStore);

  dotClass(action: string): string {
    switch (action?.toLowerCase()) {
      case 'create':
        return 'dot-create';
      case 'update':
        return 'dot-update';
      case 'delete':
        return 'dot-delete';
      default:
        return 'dot-default';
    }
  }

  badgeClass(action: string): string {
    switch (action?.toLowerCase()) {
      case 'create':
        return 'badge-create';
      case 'update':
        return 'badge-update';
      case 'delete':
        return 'badge-delete';
      default:
        return 'badge-default';
    }
  }

  getDiff(item: HistoryResponseDto) {
    if (!item.diffData) return null;
    try {
      const obj = JSON.parse(item.diffData);
      return Object.entries(obj).map(([field, val]: any) => ({
        field,
        from: val?.from ?? null,
        to: val?.to ?? null
      }));
    } catch { return null; }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  actionIcon(action: string): string {
    const map: Record<string, string> = {
      Create: 'ti-plus',
      Update: 'ti-pencil',
      Delete: 'ti-trash',
    };
    return map[action] ?? 'ti-dots';
  }
}