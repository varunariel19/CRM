import {
  Component,
  inject,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CreateLeadDto, Lead, LeadSource, LeadStatus, UpdateLeadDto } from '../../../core/types/lead.type';
import { TeamMember } from '../../../core/types/global.type';
import { LeadService } from '../../../services/lead.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuState } from '../../../state/menu.state';
import { LeadState } from '../../../state/lead.state';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { TeamState } from '../../../state/team.state';
import { PermissionFacade } from '../../../core/services/permissionFacade.service';
import { ProjectService } from '../../../services/project.service';
import { ContactService } from '../../../services/contact.service';
import { switchMap } from 'rxjs';
import { } from '../deals-pipeline/deals-pipeline.component';

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
  leadId: string;
  documents: ProjectDocument[];
}

export interface CreateClientPayload {
  name: string;
  company: string;
  email: string;
  phone?: string;
  leadId: string;
}

export interface LeadPipelineColumn {
  key: LeadStatus;
  title: string;
  color: string;
  leads: Lead[];
}

@Component({
  selector: 'app-lead-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './lead-mangement.component.html',
  styleUrls: ['./lead-mangement.component.css', '../deals-pipeline/deals-pipeline.component.css'],
})
export class LeadManagementComponent {

  leadState        = inject(LeadState);
  toastService     = inject(ToastService);
  private loader   = inject(LoaderService);
  private cdr      = inject(ChangeDetectorRef);
  private zone     = inject(NgZone);
  private projectService = inject(ProjectService);
  private contactService = inject(ContactService);
  perm             = inject(PermissionFacade);

  viewMode: 'list' | 'pipeline' = 'pipeline';

  showCreateModal = false;
  showEditModal   = false;
  editLead: Partial<UpdateLeadDto & { id: string }> = {};

  showDetailModal = false;
  detailLead: Lead | null = null;

  showConvertModal  = false;
  conversionStep: 1 | 2 = 1;
  convertingLead: Lead | null = null;
  private convertingLeadPreviousStatus: LeadStatus | null = null;

  projectForm: CreateProjectPayload = this.resetProjectForm();
  clientForm:  CreateClientPayload  = this.resetClientForm();

  isDragOver        = false;
  draggedLead: Lead | null        = null;
  draggedFromStatus: LeadStatus | null = null;

  openStatusIndex:   number | null = null;
  openAssigneeIndex: number | null = null;

  searchText    = '';
  filterStatus: LeadStatus | '' = '';
  filterSource: LeadSource | '' = '';

  newLead: CreateLeadDto = this.resetNewLead();

  readonly statusOptions: { label: LeadStatus; value: LeadStatus; className: string }[] = [
    { label: 'New',        value: 'New',        className: 'new'        },
    { label: 'Contracted', value: 'Contracted',  className: 'contracted' },
    { label: 'Qualified',  value: 'Qualified',   className: 'qualified'  },
    { label: 'Converted',  value: 'Converted',   className: 'converted'  },
    { label: 'Lost',       value: 'Lost',        className: 'lost'       },
  ];

  readonly sourceOptions: LeadSource[] = ['Website', 'Referral', 'Instagram', 'ColdCall'];

  readonly pipelineColumns: LeadPipelineColumn[] = [
    { key: 'New',        title: 'New Leads',  color: '#6366f1', leads: [] },
    { key: 'Contracted', title: 'Contracted', color: '#f59e0b', leads: [] },
    { key: 'Qualified',  title: 'Qualified',  color: '#8b5cf6', leads: [] },
    { key: 'Converted',  title: 'Converted',  color: '#10b981', leads: [] },
    { key: 'Lost',       title: 'Lost',       color: '#ef4444', leads: [] },
  ];

  constructor(
    private teamState:  TeamState,
    private menuState:  MenuState,
    private leadService: LeadService,
  ) { }

  // ── Getters ──

  get teamMembers(): TeamMember[] {
    return this.teamState.teamMembers();
  }

  get leadList(): Lead[] {
    return this.leadState.leads();
  }

  get filteredLeads(): Lead[] {
    return this.leadList.filter(lead => {
      const matchText =
        !this.searchText ||
        lead.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        lead.company.toLowerCase().includes(this.searchText.toLowerCase()) ||
        lead.email.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus = !this.filterStatus || lead.status === this.filterStatus;
      const matchSource = !this.filterSource || lead.source === this.filterSource;
      return matchText && matchStatus && matchSource;
    });
  }

  getColumnLeads(status: LeadStatus): Lead[] {
    return this.filteredLeads.filter(l => l.status === status);
  }

  getColumnTotal(status: LeadStatus): number {
    return this.getColumnLeads(status).length;
  }

  // ── Reset helpers ──

  private resetNewLead(): CreateLeadDto {
    return { name: '', company: '', email: '', phone: '', source: 'Website', assignedToId: '' };
  }

  private resetProjectForm(): CreateProjectPayload {
    return {
      name: '',
      projectLeadId: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      leadId: '',
      documents: [],
    };
  }

  private resetClientForm(): CreateClientPayload {
    return { name: '', company: '', email: '', phone: '', leadId: '' };
  }

  // ── Create Lead ──

  submitCreateLead(): void {
    if (!this.newLead.name || !this.newLead.company || !this.newLead.email) return;
    this.loader.show('Creating Lead...', 'lg');
    this.leadService.handleCreateLead(this.newLead).subscribe({
      next: (created) => {
        this.leadState.addLead(created);
        this.showCreateModal = false;
        this.newLead = this.resetNewLead();
        this.loader.hide();
        this.toastService.success('New lead added successfully!', 'New Lead');
      },
      error: (err) => {
        this.loader.hide();
        this.toastService.error('Failed to create new lead');
        console.error(err);
      },
    });
  }

  // ── Edit Lead ──

  openEditModal(lead: Lead): void {
    this.editLead = {
      id:           lead.id,
      name:         lead.name,
      company:      lead.company,
      email:        lead.email,
      phone:        lead.phone ?? '',
      source:       lead.source as LeadSource,
      status:       lead.status as LeadStatus,
      assignedToId: lead.assignedToId,
    };
    this.showEditModal = true;
  }

  submitEditLead(): void {
    if (!this.editLead.id) return;
    const { id, ...dto } = this.editLead;
    this.leadService.handleUpdateLead(id!, dto as UpdateLeadDto).subscribe({
      next: () => {
        this.leadState.updateLead(id!, this.editLead);
        this.showEditModal = false;
        this.editLead = {};
        this.toastService.success('Lead updated successfully');
      },
      error: (err) => console.error('Failed to update lead', err),
    });
  }

  // ── Detail Popup ──

  openDetailModal(lead: Lead): void {
    this.detailLead      = lead;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.detailLead      = null;
  }

  // ── Delete Lead ──

  deleteLead(id: string): void {
    this.menuState.open({
      title:   'Delete Lead',
      message: 'Are you sure you want to delete this lead? This action cannot be undone.',
      onConfirm: () => {
        this.leadService.handleRemoveLead(id).subscribe({
          next:  () => { this.leadState.removeLead(id); },
          error: (err) => console.error('Failed to delete lead', err),
        });
      },
    });
  }

  // ── Status / Assignee (list view) ──

  setStatus(lead: Lead, status: LeadStatus): void {
    this.openStatusIndex = null;
    this.moveLeadToStatus(lead, status);
  }

  setAssignee(lead: Lead, memberId: string): void {
    const memberName = this.teamMembers.find(m => m.id === memberId)?.name ?? '';
    this.menuState.open({
      title:   'Assign Lead',
      message: `Are you sure to assign this lead to ${memberName}?`,
      onConfirm: () => {
        const prev = { assignedToId: lead.assignedToId, assignedToName: lead.assignedToName };
        lead.assignedToId   = memberId;
        lead.assignedToName = memberName;
        this.leadService.handleUpdateLead(lead.id, { assignedToId: memberId }).subscribe({
          next: () => {
            this.leadState.updateLead(lead.id, { assignedToId: memberId });
            this.openAssigneeIndex = null;
          },
          error: (err) => {
            lead.assignedToId   = prev.assignedToId;
            lead.assignedToName = prev.assignedToName;
            this.openAssigneeIndex = null;
            console.error(err);
          },
        });
      },
    });
  }

  // ── Pipeline drag-drop ──

  dragLead(event: DragEvent, lead: Lead, status: LeadStatus): void {
    this.draggedLead       = lead;
    this.draggedFromStatus = status;
  }

  allowDrop(event: DragEvent): void { event.preventDefault(); }

  dropLead(event: DragEvent, targetStatus: LeadStatus): void {
    event.preventDefault();
    if (!this.draggedLead || this.draggedFromStatus === targetStatus) return;
    this.moveLeadToStatus(this.draggedLead, targetStatus);
    this.draggedLead       = null;
    this.draggedFromStatus = null;
  }

  moveLeadLeft(lead: Lead): void {
    const order: LeadStatus[] = ['New', 'Contracted', 'Qualified', 'Converted', 'Lost'];
    const idx = order.indexOf(lead.status as LeadStatus);
    if (idx <= 0) return;
    this.moveLeadToStatus(lead, order[idx - 1]);
  }

  moveLeadRight(lead: Lead): void {
    const order: LeadStatus[] = ['New', 'Contracted', 'Qualified', 'Converted', 'Lost'];
    const idx = order.indexOf(lead.status as LeadStatus);
    if (idx >= order.length - 1) return;
    this.moveLeadToStatus(lead, order[idx + 1]);
  }

  private moveLeadToStatus(lead: Lead, newStatus: LeadStatus): void {
    if (lead.status === newStatus) return;

    if (newStatus === 'Converted') {
      this.menuState.open({
        title:   'Convert Lead',
        message: `Convert "${lead.name}" to a client and project?`,
        onConfirm: () => {
          const previousStatus = lead.status as LeadStatus;
          this.leadState.updateLead(lead.id, { status: newStatus });
          this.openConversionFlow(lead, previousStatus);
        },
      });
      return;
    }

    this.menuState.open({
      title:   'Move Lead',
      message: `Move "${lead.name}" to ${newStatus}?`,
      onConfirm: () => {
        this.loader.show();
        const previousStatus = lead.status as LeadStatus;
        this.leadState.updateLead(lead.id, { status: newStatus });
        this.leadService.handleUpdateLead(lead.id, { status: newStatus }).subscribe({
          next: () => {
            this.loader.hide();
            this.toastService.info(`"${lead.name}" moved to ${newStatus}`);
          },
          error: () => {
            this.loader.hide();
            this.toastService.error('Failed to move lead.');
            this.leadState.updateLead(lead.id, { status: previousStatus });
          },
        });
      },
    });
  }

  private openConversionFlow(lead: Lead, previousStatus: LeadStatus): void {
    this.zone.run(() => {
      this.convertingLead               = { ...lead };
      this.convertingLeadPreviousStatus = previousStatus;
      this.projectForm = { ...this.resetProjectForm(), leadId: lead.id, name: lead.name };
      this.clientForm  = {
        ...this.resetClientForm(),
        leadId:  lead.id,
        name:    lead.name,
        company: lead.company,
        email:   lead.email,
        phone:   lead.phone ?? '',
      };
      this.conversionStep   = 1;
      this.showConvertModal = true;
      this.cdr.detectChanges();
    });
  }

  // Cancel button / overlay click — reverts optimistic status then closes
  closeConvertModal(): void {
    if (this.convertingLead && this.convertingLeadPreviousStatus) {
      this.leadState.updateLead(this.convertingLead.id, { status: this.convertingLeadPreviousStatus });
    }
    this._closeConvertModalAndReset();
  }

  closeConvertModalOnOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeConvertModal();
    }
  }

  proceedToClientCreation(): void {
    if (!this.projectForm.name || !this.projectForm.projectLeadId) {
      this.toastService.error('Project name and lead are required.');
      return;
    }
    this.conversionStep = 2;
  }

  goBackToProjectStep(): void {
    this.conversionStep = 1;
  }

  // ── Conversion submit: lead update → CLIENT → PROJECT ──

  submitConversion(): void {
    if (!this.clientForm.name || !this.clientForm.company || !this.clientForm.email) {
      this.toastService.error('Client name, company and email are required.');
      return;
    }
    if (!this.convertingLead) return;

    const formData = new FormData();
    formData.append('name',          this.projectForm.name);
    formData.append('projectLeadId', this.projectForm.projectLeadId);
    formData.append('leadId',        this.projectForm.leadId);
    if (this.projectForm.description) formData.append('description', this.projectForm.description);
    if (this.projectForm.startDate)   formData.append('startDate',   this.projectForm.startDate);
    if (this.projectForm.endDate)     formData.append('endDate',     this.projectForm.endDate);
    this.projectForm.documents.forEach(doc =>
      formData.append('documents', doc.file, doc.name)
    );

    // Capture values now — state is wiped before next/error fires
    const leadId         = this.convertingLead.id;
    const leadName       = this.convertingLead.name;
    const clientName     = this.clientForm.name;
    const projectName    = this.projectForm.name;
    const previousStatus = this.convertingLeadPreviousStatus;

    this.loader.show('Converting lead...', 'lg');

    this.leadService.handleUpdateLead(leadId, { status: 'Converted' })
      .pipe(
        switchMap(() => this.contactService.createContact(this.clientForm)),  // client first
        switchMap(() => this.projectService.createProject(formData)),         // project second
      )
      .subscribe({
        next: () => {
          this.loader.hide();
          this.toastService.success(`Client "${clientName}" created!`);
          this.toastService.success(`Project "${projectName}" created!`);
          this.toastService.success(`Lead "${leadName}" converted successfully!`);
          this._closeConvertModalAndReset();    // ← closes on success
        },
        error: (err) => {
          this.loader.hide();
          this.toastService.error('Conversion failed. Please try again.');
          // Revert optimistic lead status so the user can retry
          if (previousStatus) {
            this.leadState.updateLead(leadId, { status: previousStatus });
          }
          this._closeConvertModalAndReset();    // ← closes on error too
          console.error(err);
        },
      });
  }

  /**
   * Single source of truth for tearing down the conversion modal.
   * Status reversion is the caller's responsibility before invoking this.
   */
  private _closeConvertModalAndReset(): void {
    this.showConvertModal             = false;
    this.conversionStep               = 1;
    this.convertingLead               = null;
    this.convertingLeadPreviousStatus = null;
    this.projectForm                  = this.resetProjectForm();
    this.clientForm                   = this.resetClientForm();
  }

  // ── File upload ──

  onDocFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) { this.addFiles(Array.from(input.files)); input.value = ''; }
  }

  onDocDragOver(event: DragEvent): void {
    event.preventDefault(); event.stopPropagation(); this.isDragOver = true;
  }

  onDocDragLeave(event: DragEvent): void {
    event.preventDefault(); event.stopPropagation(); this.isDragOver = false;
  }

  onDocDrop(event: DragEvent): void {
    event.preventDefault(); event.stopPropagation(); this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) this.addFiles(Array.from(files));
  }

  private addFiles(files: File[]): void {
    const MAX = 20 * 1024 * 1024;
    for (const file of files) {
      if (file.size > MAX) {
        this.toastService.error(`"${file.name}" exceeds 20 MB limit.`);
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
      case 'pdf':                              return 'fa-file-pdf';
      case 'doc':  case 'docx':               return 'fa-file-word';
      case 'xls':  case 'xlsx':               return 'fa-file-excel';
      case 'png':  case 'jpg': case 'jpeg':
      case 'gif':  case 'webp':               return 'fa-file-image';
      case 'zip':  case 'rar':                return 'fa-file-archive';
      default:                                return 'fa-file-alt';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024)         return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ── Search / helpers ──

  onSearch(value: string): void { this.searchText = value; }

  statusClass(status: string): string { return status.toLowerCase(); }

  toggleStatus(index: number): void {
    this.openStatusIndex   = this.openStatusIndex === index ? null : index;
    this.openAssigneeIndex = null;
  }

  toggleAssignee(index: number): void {
    this.openAssigneeIndex = this.openAssigneeIndex === index ? null : index;
    this.openStatusIndex   = null;
  }

  getAssigneeName(memberId: string): string {
    return this.teamMembers.find(m => m.id === memberId)?.name ?? 'Unassigned';
  }

  closeModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showCreateModal = false;
    }
  }

  closeEditModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showEditModal = false;
    }
  }

  closeDetailModalOnOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeDetailModal();
    }
  }
}