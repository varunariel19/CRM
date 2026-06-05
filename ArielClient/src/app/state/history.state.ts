import { Injectable, signal, computed } from '@angular/core';
import { HistoryResponseDto } from '../core/services/history.service';


@Injectable({ providedIn: 'root' })
export class HistoryState {

    private _recentHistory = signal<HistoryResponseDto[]>([]);
    private _isLoading = signal(false);
    private _selectedLog = signal<HistoryResponseDto | null>(null);

    recentHistory = computed(() => this._recentHistory());
    isLoading = computed(() => this._isLoading());
    selectedLog = computed(() => this._selectedLog());


    setHistoryLogs(logs: HistoryResponseDto[]): void {
        this._recentHistory.set(logs);
    }

    // when deleted or reverted !! 
    removeLog(id: string): void {
        this._recentHistory.update(logs => logs.filter(d => d.id !== id));
        if (this._selectedLog()?.id === id) {
            this._selectedLog.set(null);
        }
    }

    setSelectedLog(log : HistoryResponseDto | null ) {
         this._selectedLog.set(log);
    }

    setLoading(loading: boolean): void {
        this._isLoading.set(loading);
    }

    clear(): void {
        this._recentHistory.set([]);
        this._selectedLog.set(null);
    }
}