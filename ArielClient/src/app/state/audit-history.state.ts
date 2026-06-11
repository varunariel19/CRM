import { Injectable, signal, computed } from '@angular/core';
import { AuditHistoryService, HistoryResponseDto } from '../core/services/audit-history.service';

export interface AuditHistoryState {
  visible: boolean;
  entityName: string;
  entityId: string;
  entityDisplayName: string;
  items: HistoryResponseDto[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuditHistoryStore {
  private _state = signal<AuditHistoryState>({
    visible: false,
    entityName: '',
    entityId: '',
    entityDisplayName: '',
    items: [],
    loading: false,
    error: null
  });

  readonly state = this._state.asReadonly();
  readonly visible = computed(() => this._state().visible);
  readonly loading = computed(() => this._state().loading);
  readonly items = computed(() => this._state().items);
  readonly title = computed(() => {
    const s = this._state();
    return s.entityDisplayName
      ? `${s.entityName} history — ${s.entityDisplayName}`
      : `${s.entityName} history`;
  });

  constructor(private svc: AuditHistoryService) {}

  open(entityName: string, entityId: string, entityDisplayName = '') {
    this._state.set({
      visible: true,
      entityName,
      entityId,
      entityDisplayName,
      items: [],
      loading: true,
      error: null
    });

    this.svc.getByEntity(entityName, entityId).subscribe({
      next: items => this._state.update(s => ({ ...s, items, loading: false })),
      error: err  => this._state.update(s => ({
        ...s, loading: false,
        error: err?.error?.message ?? 'Failed to load history.'
      }))
    });
  }

  close() {
    this._state.update(s => ({ ...s, visible: false }));
  }

  revert(auditLogId: string) {
    this.svc.revert(auditLogId).subscribe({
      next: () => {
        const s = this._state();
        this.open(s.entityName, s.entityId, s.entityDisplayName);
      },
      error: err => this._state.update(s => ({
        ...s, error: err?.error?.message ?? 'Revert failed.'
      }))
    });
  }
}