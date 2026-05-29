import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Deal,
  CreateDealPayload,
  UpdateDealPayload,
  DealStage,
  DEAL_STAGE
} from '../../../core/types/deal.type';

import { DealService } from '../../../services/deal.service';

import { TeamMember } from '../../../core/types/global.type';
import { Contact } from '../../../core/types/contact.type';

import { AuthState } from '../../../state/auth.state';

export interface DealColumn {
  key: string;
  title: string;
  color: string;
  stage: DealStage;
  deals: any[];
}

const StageMapping: Record<string, DealStage> = {
  proposal: DEAL_STAGE.PROPOSAL,
  negotiation: DEAL_STAGE.NEGOTIATION,
  won: DEAL_STAGE.WON,
  lost: DEAL_STAGE.LOST
};

@Component({
  selector: 'app-deals-pipeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deals-pipeline.component.html',
  styleUrl: './deals-pipeline.component.css',
})
export class DealsPipelineComponent implements OnChanges {

  @Input() clients: Contact[] = [];
  @Input() deals: Deal[] = [];

  authState = inject(AuthState);

  get teamMembers(): TeamMember[] {
    return this.authState.teamMembers();
  }

  columns: DealColumn[] = [
    {
      key: 'proposal',
      title: 'PROPOSAL',
      color: '#2563eb',
      stage: DEAL_STAGE.PROPOSAL,
      deals: [],
    },
    {
      key: 'negotiation',
      title: 'NEGOTIATION',
      color: '#f59e0b',
      stage: DEAL_STAGE.NEGOTIATION,
      deals: [],
    },
    {
      key: 'won',
      title: 'WON',
      color: '#10b981',
      stage: DEAL_STAGE.WON,
      deals: [],
    },
    {
      key: 'lost',
      title: 'LOST',
      color: '#ef4444',
      stage: DEAL_STAGE.LOST,
      deals: [],
    },
  ];

  draggedDeal: any = null;
  draggedFrom = '';

  showCreateModal = false;
  showEditModal = false;

  newDeal: CreateDealPayload = this.resetCreateForm();

  editDeal: any = {};

  constructor(private dealService: DealService) { }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['deals']) {
      console.log('Deals Input Updated:', this.deals);
      this.loadPipelineBoard();
    }
  }

  private resetCreateForm(): CreateDealPayload {
    return {
      title: '',
      value: 0,
      stage: DEAL_STAGE.PROPOSAL,
      closeDate: new Date().toISOString().split('T')[0],
      assignedToId: '',
      contactId: null
    };
  }

  loadPipelineBoard(): void {

    this.columns.forEach(col => col.deals = []);

    this.deals.forEach(deal => {

      const formattedDeal = {
        id: deal.id,
        title: deal.title,
        value: deal.value,
        closeDate: deal.closeDate,
        stage: deal.stage,
        assignedToId: deal.assignedToId,
        contactId: deal.contactId,
        company: deal.contact?.company || 'No Company',
        owner: deal.assignedTo?.name || 'Unassigned',
      };

      const targetColumn = this.columns.find(
        c => c.stage === deal.stage
      );

      if (targetColumn) {
        targetColumn.deals.push(formattedDeal);
      }
    });

    console.log('Pipeline Columns:', this.columns);
  }

  submitDeal(): void {

    if (!this.newDeal.title || !this.newDeal.assignedToId) {
      alert('Title and Representative assignment fields are required.');
      return;
    }

    this.dealService.createDeal(this.newDeal).subscribe({
      next: (createdDeal) => {

        this.deals = [...this.deals, createdDeal];

        this.loadPipelineBoard();

        this.showCreateModal = false;

        this.newDeal = this.resetCreateForm();
      },
      error: (err) => {
        console.error('Failed to create deal', err);
      }
    });
  }

  submitEdit(): void {

    const payload: UpdateDealPayload = {
      title: this.editDeal.title,
      value: this.editDeal.value,
      stage: typeof this.editDeal.stage === 'string'
        ? StageMapping[this.editDeal.stage]
        : this.editDeal.stage,
      closeDate: this.editDeal.closeDate,
      assignedToId: this.editDeal.assignedToId,
      contactId: this.editDeal.contactId || null
    };

    this.dealService.updateDeal(this.editDeal.id, payload).subscribe({
      next: () => {

        const index = this.deals.findIndex(
          d => d.id === this.editDeal.id
        );

        if (index !== -1) {

          this.deals[index] = {
            ...this.deals[index],
            ...payload
          } as Deal;
        }

        this.loadPipelineBoard();

        this.showEditModal = false;
      },
      error: (err) => {
        console.error('Failed updating deal', err);
      }
    });
  }

  moveDeal(fromKey: string, toKey: string, deal: any): void {

    const source = this.columns.find(c => c.key === fromKey);

    const target = this.columns.find(c => c.key === toKey);

    if (!source || !target) return;

    const nextEnumStage = StageMapping[toKey];

    source.deals = source.deals.filter(d => d.id !== deal.id);

    deal.stage = nextEnumStage;

    target.deals.push(deal);

    this.dealService.updateDealStage(deal.id, {
      stage: nextEnumStage
    }).subscribe({
      error: (err) => {
        console.error('Failed updating stage', err);
        this.loadPipelineBoard();
      }
    });
  }

  getTotal(deals: any[]): number {
    return deals.reduce((sum, deal) => sum + deal.value, 0);
  }

  openEditModal(deal: any): void {

    let currentStringKey = 'proposal';

    if (deal.stage === DEAL_STAGE.NEGOTIATION) {
      currentStringKey = 'negotiation';
    }

    if (deal.stage === DEAL_STAGE.WON) {
      currentStringKey = 'won';
    }

    if (deal.stage === DEAL_STAGE.LOST) {
      currentStringKey = 'lost';
    }

    this.editDeal = {
      ...deal,
      stage: currentStringKey
    };

    this.showEditModal = true;
  }

  closeCreateModal(event: MouseEvent): void {

    if (
      (event.target as HTMLElement)
        .classList.contains('modal-overlay')
    ) {
      this.showCreateModal = false;
    }
  }

  closeEditModal(event: MouseEvent): void {

    if (
      (event.target as HTMLElement)
        .classList.contains('modal-overlay')
    ) {
      this.showEditModal = false;
    }
  }

  dragDeal(event: DragEvent, deal: any, columnKey: string): void {
    this.draggedDeal = deal;
    this.draggedFrom = columnKey;
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  dropDeal(event: DragEvent, targetColumn: string): void {

    event.preventDefault();

    if (
      !this.draggedDeal ||
      this.draggedFrom === targetColumn
    ) {
      return;
    }

    this.moveDeal(
      this.draggedFrom,
      targetColumn,
      this.draggedDeal
    );

    this.draggedDeal = null;
  }

  moveLeft(currentKey: string, deal: any): void {

    const currentIndex = this.columns.findIndex(
      c => c.key === currentKey
    );

    if (currentIndex <= 0) return;

    this.moveDeal(
      currentKey,
      this.columns[currentIndex - 1].key,
      deal
    );
  }

  moveRight(currentKey: string, deal: any): void {

    const currentIndex = this.columns.findIndex(
      c => c.key === currentKey
    );

    if (currentIndex >= this.columns.length - 1) return;

    this.moveDeal(
      currentKey,
      this.columns[currentIndex + 1].key,
      deal
    );
  }
}