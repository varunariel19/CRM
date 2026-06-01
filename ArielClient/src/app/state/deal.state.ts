import { Injectable, signal, computed } from '@angular/core';
import { Deal, DealStage, PipelineColumn, DEAL_STAGE } from '../core/types/deal.type';

const PIPELINE_COLUMNS: Omit<PipelineColumn, 'deals'>[] = [
    { key: 'proposal', title: 'PROPOSAL', color: '#6366f1', stage: DEAL_STAGE.PROPOSAL },
    { key: 'negotiation', title: 'NEGOTIATION', color: '#f59e0b', stage: DEAL_STAGE.NEGOTIATION },
    { key: 'won', title: 'WON', color: '#22c55e', stage: DEAL_STAGE.WON },
    { key: 'lost', title: 'LOST', color: '#ef4444', stage: DEAL_STAGE.LOST },
];

@Injectable({ providedIn: 'root' })
export class DealState {

    private _deals = signal<Deal[]>([]);
    private _isLoading = signal(false);
    private _selectedDeal = signal<Deal | null>(null);

    deals = computed(() => this._deals());
    isLoading = computed(() => this._isLoading());
    selectedDeal = computed(() => this._selectedDeal());

    totalDeals = computed(() => this._deals().length);
    hasDeals = computed(() => this._deals().length > 0);

    pipelineColumns = computed<PipelineColumn[]>(() =>
        PIPELINE_COLUMNS.map(col => ({
            ...col,
            deals: this._deals().filter(d => d.stage === col.stage),
        }))
    );

    totalValue = computed(() =>
        this._deals().reduce((sum, d) => sum + d.value, 0)
    );

    wonValue = computed(() =>
        this._deals()
            .filter(d => d.stage === DEAL_STAGE.WON)
            .reduce((sum, d) => sum + d.value, 0)
    );

    dealsByStage = computed(() => {
        const map = new Map<DealStage, Deal[]>();
        for (const stage of Object.values(DEAL_STAGE)) {
            map.set(stage, []);
        }
        for (const deal of this._deals()) {
            map.get(deal.stage)!.push(deal);
        }
        return map;
    });

    setDeals(deals: Deal[]): void {
        this._deals.set(deals);
    }

    addDeal(deal: Deal): void {
        this._deals.update(deals => [deal, ...deals]);
    }

    removeDeal(id: string): void {
        this._deals.update(deals => deals.filter(d => d.id !== id));
        if (this._selectedDeal()?.id === id) {
            this._selectedDeal.set(null);
        }
    }

    updateDeal(id: string, updated: Partial<Deal>): void {
        this._deals.update(deals =>
            deals.map(d => d.id === id ? { ...d, ...updated } : d)
        );
        if (this._selectedDeal()?.id === id) {
            this._selectedDeal.update(d => d ? { ...d, ...updated } : null);
        }
    }

    moveDealToStage(id: string, stage: DealStage): void {
        this.updateDeal(id, { stage });
    }

    selectDeal(deal: Deal | null): void {
        this._selectedDeal.set(deal);
    }

    setLoading(loading: boolean): void {
        this._isLoading.set(loading);
    }

    clear(): void {
        this._deals.set([]);
        this._selectedDeal.set(null);
    }
}