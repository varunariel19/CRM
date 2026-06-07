import {
  Component,
  inject,
  ChangeDetectorRef,
  NgZone,
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
import { switchMap } from 'rxjs';
import { ContactState } from '../../../state/contact.state';
import { DealState } from '../../../state/deal.state';
import { MenuState } from '../../../state/menu.state';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { TeamState } from '../../../state/team.state';
import { PermissionFacade } from '../../../core/services/permissionFacade.service';
import { ProjectService } from '../../../services/project.service';

export interface ProjectDocument {
  name: string;
  size: number;
  file: File;
}

export interface CreateProjectPayload {
  name: string;
  projectLeadId: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  dealId: string;
  documents: ProjectDocument[];
}

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

  private teamState = inject(TeamState);
  private menuState = inject(MenuState);
  private toast = inject(ToastService);
  private loader = inject(LoaderService);
  private contactState = inject(ContactState);
  private projectService = inject(ProjectService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  readonly dealState = inject(DealState);
  perm = inject(PermissionFacade);

  constructor(private dealService: DealService) { }

  draggedDeal: Deal | null = null;
  draggedFrom = '';

  showCreateModal = false;
  showEditModal = false;
  showConvertModal = false;

  convertingDeal: Deal | null = null;
  projectForm: CreateProjectPayload = this.resetProjectForm('', '');
  private convertingDealPreviousStage: DealStage | null = null;

  isDragOver = false;

  newDeal: CreateDealPayload = this.resetCreateForm();
  editDeal: (Partial<Deal> & { id: string; stage: string }) | null = null;

  get teamMembers(): TeamMember[] { return this.teamState.teamMembers(); }
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

  private resetProjectForm(dealId: string, dealTitle: string): CreateProjectPayload {
    return {
      name: dealTitle,
      projectLeadId: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      dealId,
      documents: [],
    };
  }



  

  private openConvertModal(deal: Deal, previousStage: DealStage): void {
    this.zone.run(() => {
      this.convertingDeal = { ...deal };
      this.convertingDealPreviousStage = previousStage;
      this.projectForm = this.resetProjectForm(deal.id, deal.title);
      this.showConvertModal = true;
      this.cdr.detectChanges();
    });
  }

  closeConvertModalOnOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeConvertModal();
    }
  }

  closeConvertModal(): void {
    if (this.convertingDeal && this.convertingDealPreviousStage) {
      this.dealState.moveDealToStage(this.convertingDeal.id, this.convertingDealPreviousStage);
    }
    this.showConvertModal = false;
    this.convertingDeal = null;
    this.convertingDealPreviousStage = null;
  }


  onDocFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onDocDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDocDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDocDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) this.addFiles(Array.from(files));
  }

  private addFiles(files: File[]): void {
    const MAX = 20 * 1024 * 1024;
    for (const file of files) {
      if (file.size > MAX) {
        this.toast.error(`"${file.name}" exceeds the 20 MB limit and was skipped.`);
        continue;
      }
      if (!this.projectForm.documents.some(d => d.name === file.name)) {
        this.projectForm.documents.push({ name: file.name, size: file.size, file });
      }
    }
  }

  removeDocument(index: number): void {
    this.projectForm.documents.splice(index, 1);
  }

  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'fa-file-pdf';
      case 'doc': case 'docx': return 'fa-file-word';
      case 'xls': case 'xlsx': return 'fa-file-excel';
      case 'png': case 'jpg':
      case 'jpeg': case 'gif':
      case 'webp': return 'fa-file-image';
      case 'zip': case 'rar': return 'fa-file-archive';
      default: return 'fa-file-alt';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
        const assignedTo = this.teamState.teamMembers().find(m => m.id === payload.assignedToId) ?? null;
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

    if (toKey === 'won') {
      this.menuState.open({
        title: 'Mark Deal as Won',
        message: `Confirm moving "${deal.title}" to Won. You'll be prompted to convert it into a project.`,
        onConfirm: () => {
          const previousStage = StageMapping[fromKey];
          this.dealState.moveDealToStage(deal.id, nextStage);
          this.openConvertModal(deal, previousStage);
        },
      });
      return;
    }

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
          error: () => {
            this.loader.hide();
            this.toast.error('Failed to move deal. Please try again.');
            this.dealState.moveDealToStage(deal.id, StageMapping[fromKey]);
          },
        });
      },
    });
  }



  submitProjectConversion(): void {
    if (!this.projectForm.name || !this.projectForm.projectLeadId) {
      this.toast.error('Project name, key, and lead are required.');
      return;
    }

    if (!this.convertingDeal) {
      this.toast.error('No deal selected.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.projectForm.name);
    formData.append('projectLeadId', this.projectForm.projectLeadId);
    formData.append('dealId', this.projectForm.dealId);

    if (this.projectForm.description) {
      formData.append('description', this.projectForm.description);
    }

    if (this.projectForm.startDate) {
      formData.append('startDate', this.projectForm.startDate);
    }

    if (this.projectForm.endDate) {
      formData.append('endDate', this.projectForm.endDate);
    }

    this.projectForm.documents.forEach(doc => {
      formData.append('documents', doc.file, doc.name);
    });

    this.loader.show('Converting deal to project...', 'lg');

    this.dealService
      .updateDealStage(this.convertingDeal.id, { stage: DEAL_STAGE.WON })
      .pipe(
        switchMap(() => this.projectService.createProject(formData))
      )
      .subscribe({
        next: (project: any) => {
          this.loader.hide();

          this.toast.success(`"${this.convertingDeal?.title}" marked as Won!`);
          this.toast.success(`Project "${project.name}" created successfully!`);

          this.showConvertModal = false;
          this.convertingDeal = null;
          this.convertingDealPreviousStage = null;
        },
        error: (err: any) => {
          this.loader.hide();
          this.showConvertModal = false;
          this.toast.error('Failed to convert deal to project.');
          console.error(err);
        }
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

  allowDrop(event: DragEvent): void { event.preventDefault(); }

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

  deleteDeal(id: string) { }
}