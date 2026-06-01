import {
  Component,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Deal,
  CreateDealPayload,
  DealStage,
  DEAL_STAGE,
  PipelineColumn
} from '../../../core/types/deal.type';

import { DealService } from '../../../services/deal.service';

import { TeamMember } from '../../../core/types/global.type';
import { Contact } from '../../../core/types/contact.type';

import { AuthState } from '../../../state/auth.state';
import { ContactState } from '../../../state/contact.state';
import { DealState } from '../../../state/deal.state';
import { MenuState } from '../../../state/menu.state';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';


const StageMapping: Record<string, DealStage> = {
  proposal: DEAL_STAGE.PROPOSAL,
  negotiation: DEAL_STAGE.NEGOTIATION,
  won: DEAL_STAGE.WON,
  lost: DEAL_STAGE.LOST,
};

const StageToKey: Record<DealStage, string> = {
  [DEAL_STAGE.PROPOSAL]: 'proposal',
  [DEAL_STAGE.NEGOTIATION]: 'negotiation',
  [DEAL_STAGE.WON]: 'won',
  [DEAL_STAGE.LOST]: 'lost',
};

@Component({
  selector: 'app-deals-pipeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deals-pipeline.component.html',
  styleUrl: './deals-pipeline.component.css',
})
export class DealsPipelineComponent {

  private authState = inject(AuthState);
  private menuState = inject(MenuState);
  private toast = inject(ToastService);
  private loader = inject(LoaderService);
  private contactState = inject(ContactState);
  readonly dealState = inject(DealState);

  constructor(private dealService: DealService) { }

  draggedDeal: Deal | null = null;
  draggedFrom = '';

  showCreateModal = false;
  showEditModal = false;

  newDeal: CreateDealPayload = this.resetCreateForm();
  editDeal: (Partial<Deal> & { id: string; stage: string }) | null = null;

  get teamMembers(): TeamMember[] {
    return this.authState.teamMembers().filter(m => m.role !== 'Admin');
  }
  get clients(): Contact[] { return this.contactState.contacts(); }
  get columns(): PipelineColumn[] { return this.dealState.pipelineColumns(); }

  private resetCreateForm(): CreateDealPayload {
    return {
      title: '',
      value: 0,
      stage: DEAL_STAGE.PROPOSAL,
      closeDate: new Date().toISOString().split('T')[0],
      assignedToId: '',
      contactId: null,
    };
  }

  getTotal(deals: Deal[]): number {
    return deals.reduce((sum, d) => sum + d.value, 0);
  }

  submitDeal(): void {
    if (!this.newDeal.title || !this.newDeal.assignedToId) {
      alert('Title and Representative assignment fields are required.');
      return;
    }

    this.loader.show('Creating new Deal...', 'lg');
    this.dealService.createDeal(this.newDeal).subscribe({
      next: (created) => {
        this.dealState.addDeal(created);
        this.showCreateModal = false;
        this.newDeal = this.resetCreateForm();
        this.loader.hide();
        this.toast.success(`Deal "${created.title}" created successfully`);
      },
      error: (err) => {
        this.loader.hide();
        this.toast.error('Failed to create deal. Please try again.');
        console.error('Failed to create deal', err);
      },
    });
  }

  openEditModal(deal: Deal): void {
    this.editDeal = {
      id: deal.id,
      title: deal.title,
      value: deal.value,
      stage: StageToKey[deal.stage] as DealStage,
      closeDate: deal.closeDate,
      assignedToId: deal.assignedToId,
      contactId: deal.contactId,
    };
    this.showEditModal = true;
  }

  submitEdit(): void {
    if (!this.editDeal) return;

    const payload: Partial<Deal> = {
      title: this.editDeal.title,
      value: this.editDeal.value,
      stage: StageMapping[this.editDeal.stage] ?? this.editDeal.stage as DealStage,
      closeDate: this.editDeal.closeDate,
      assignedToId: this.editDeal.assignedToId,
      contactId: this.editDeal.contactId,
    };

    this.loader.show('Updating Deal...', 'lg');
    this.dealService.updateDeal(this.editDeal.id, payload).subscribe({
      next: () => {
        const assignedTo = this.authState.teamMembers().find(m => m.id === payload.assignedToId) ?? null;
        const contact = this.contactState.contacts().find(c => c.id === payload.contactId) ?? null;

        this.dealState.updateDeal(this.editDeal!.id, { ...payload, assignedTo, contact });
        this.showEditModal = false;
        this.editDeal = null;
        this.loader.hide();
        this.toast.success(`Deal "${payload.title}" updated successfully`);
      },
      error: (err) => {
        this.loader.hide();
        this.toast.error('Failed to update deal. Please try again.');
        console.error('Failed updating deal', err);
      },
    });
  }

  private moveDeal(fromKey: string, toKey: string, deal: Deal): void {
    if (fromKey === toKey) return;

    const nextStage = StageMapping[toKey];
    if (!nextStage) return;

    this.menuState.open({
      title: 'Move Deal',
      message: `Are you sure you want to move "${deal.title}" to ${nextStage}?`,

      onConfirm: () => {
        this.loader.show();
        this.dealState.moveDealToStage(deal.id, nextStage);

        this.dealService.updateDealStage(deal.id, { stage: nextStage }).subscribe({
          next: () => {
            this.loader.hide();
            this.toast.info(`"${deal.title}" moved to ${nextStage}`);
          },
          error: (err) => {
            this.loader.hide();
            this.toast.error('Failed to move deal. Please try again.');
            console.error('Failed updating stage', err);
            this.dealState.moveDealToStage(deal.id, StageMapping[fromKey]);
          },
        });
      },
    });
  }

  moveLeft(currentKey: string, deal: Deal): void {
    const idx = this.columns.findIndex(c => c.key === currentKey);
    if (idx <= 0) return;
    this.moveDeal(currentKey, this.columns[idx - 1].key, deal);
  }

  moveRight(currentKey: string, deal: Deal): void {
    const idx = this.columns.findIndex(c => c.key === currentKey);
    if (idx >= this.columns.length - 1) return;
    this.moveDeal(currentKey, this.columns[idx + 1].key, deal);
  }

  dragDeal(event: DragEvent, deal: Deal, columnKey: string): void {
    this.draggedDeal = deal;
    this.draggedFrom = columnKey;
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  dropDeal(event: DragEvent, targetKey: string): void {
    event.preventDefault();
    if (!this.draggedDeal || this.draggedFrom === targetKey) return;
    this.moveDeal(this.draggedFrom, targetKey, this.draggedDeal);
    this.draggedDeal = null;
    this.draggedFrom = '';
  }

  closeCreateModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showCreateModal = false;
    }
  }

  closeEditModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showEditModal = false;
      this.editDeal = null;
    }
  }
}