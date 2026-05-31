import { Injectable, signal, computed } from '@angular/core';
import { Lead } from '../core/types/lead.type';

@Injectable({ providedIn: 'root' })
export class LeadState {
    private _leads = signal<Lead[]>([]);
    private _isLoading = signal(false);
    private _selectedLead = signal<Lead | null>(null);

    // Public read-only
    leads = computed(() => this._leads());
    isLoading = computed(() => this._isLoading());
    selectedLead = computed(() => this._selectedLead());

    // Derived
    totalLeads = computed(() => this._leads().length);
    hasLeads = computed(() => this._leads().length > 0);

    setLeads(leads: Lead[]): void {
        this._leads.set(leads);
    }

    addLead(lead: Lead): void {
        this._leads.update(leads => [lead, ...leads]);
    }

    removeLead(id: string): void {
        this._leads.update(leads => leads.filter(l => l.id !== id));
    }

    updateLead(id: string, updated: Partial<Lead>): void {
        this._leads.update(leads =>
            leads.map(l => l.id === id ? { ...l, ...updated } : l)
        );
    }

    selectLead(lead: Lead | null): void {
        this._selectedLead.set(lead);
    }

    setLoading(loading: boolean): void {
        this._isLoading.set(loading);
    }

    clear(): void {
        this._leads.set([]);
        this._selectedLead.set(null);
    }
}