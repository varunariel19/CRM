import {
  Component,
  inject,
  ChangeDetectorRef,
  NgZone,
  OnInit,
  effect,
  signal,
} from '@angular/core';
import { CreateLeadDto, Lead, LeadSource, LeadStatus, UpdateLeadDto, ProjectType, LeadProject } from '../../../core/types/lead.type';
import { TeamMember } from '../../../core/types/global.type';
import { LeadService } from '../../../services/lead.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuState } from '../../../state/menu.state';
import { LeadState } from '../../../state/lead.state';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { TeamState } from '../../../state/team.state';
import { PermissionFacade } from '../../../core/services/permissionFacade.service';
import { ProjectService } from '../../../services/project.service';
import { ContactService } from '../../../services/contact.service';
import { map, switchMap } from 'rxjs';
import { AuthState } from '../../../state/auth.state';
import { DepartmentItem, GlobalState } from '../../../state/global.state';
import { DepartmentKey } from '../../../core/constants/global';
import { AuditHistoryStore } from '../../../state/audit-history.state';
import { TeamsService } from '../../../services/teams.service';
import { DeepLinkService } from '../../../core/services/deepLink.service';
import { ActivatedRoute } from '@angular/router';
import { ContactState } from '../../../state/contact.state';
import { UserProfileComponent } from '../../../components/items/user-profile/user-profile.component';


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
  endDate?: string | null;
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

export interface CreateProjectForLeadPayload {
  name: string;
  projectType: ProjectType | '';
  budget: number | null;
  startDate: string;
  endDate: string | null;
  leadId: string;
}

export const leadSourceOptions: { value: LeadSource; label: string }[] = [
  { value: 'MarketingPlatform', label: 'Marketing Platform' },
  { value: 'Website', label: 'Website' },
  { value: 'Referrals', label: 'Referrals' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Events', label: 'Events' },
  { value: 'Partners', label: 'Partners' },
  { value: 'ColdOutreach', label: 'Cold Outreach' }
];


@Component({
  selector: 'app-lead-management',
  imports: [CommonModule, FormsModule, UserProfileComponent],
  templateUrl: './lead-mangement.component.html',
  styleUrls: ['./lead-mangement.component.scss', '../deals-pipeline/deals-pipeline.component.css'],
})
export class LeadManagementComponent implements OnInit {

  leadState = inject(LeadState);
  authState = inject(AuthState);
  globalState = inject(GlobalState);
  toastService = inject(ToastService);
  contactState = inject(ContactState);
  private loader = inject(LoaderService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private projectService = inject(ProjectService);
  private contactService = inject(ContactService);
  perm = inject(PermissionFacade);
  history = inject(AuditHistoryStore);
  teamsService = inject(TeamsService);
  private deepLink = inject(DeepLinkService);
  private location = inject(Location);

  viewMode: 'list' | 'pipeline' = 'pipeline';

  showCreateModal = false;
  showEditModal = false;
  editLead: Partial<UpdateLeadDto & { id: string }> = {};

  showDetailModal = false;
  detailLead: Lead | null = null;

  showConvertModal = false;
  conversionStep: 1 | 2 = 1;
  convertingLead: Lead | null = null;
  private convertingLeadPreviousStatus: LeadStatus | null = null;

  projectForm: CreateProjectPayload = this.resetProjectForm();
  clientForm: CreateClientPayload = this.resetClientForm();

  isDragOver = false;
  draggedLead: Lead | null = null;
  draggedFromStatus: LeadStatus | null = null;

  openStatusIndex: number | null = null;
  openAssigneeIndex: number | null = null;

  searchText = '';
  filterStatus: LeadStatus | '' = '';
  filterSource: LeadSource | '' = '';

  leadSourceOptions = leadSourceOptions;

  newLead: CreateLeadDto = this.resetNewLead();
  showOnlyMyLeads = this.authState.user()?.accessLevel.access != 100 ? true : false;

  readonly projectTypeOptions: ProjectType[] = ['Hourly', 'FixedPrice', 'ManMonth'];

  readonly statusOptions: { label: LeadStatus; value: LeadStatus; className: string }[] = [
    { label: 'Contracted', value: 'Contracted', className: 'contracted' },
    { label: 'Qualified', value: 'Qualified', className: 'qualified' },
    { label: 'Converted', value: 'Converted', className: 'converted' },
    { label: 'Lost', value: 'Lost', className: 'lost' },
  ];


  readonly pipelineColumns: LeadPipelineColumn[] = [
    { key: 'Contracted', title: 'Contracted', color: '#f59e0b', leads: [] },
    { key: 'Qualified', title: 'Qualified', color: '#8b5cf6', leads: [] },
    { key: 'Converted', title: 'Converted', color: '#10b981', leads: [] },
    { key: 'Lost', title: 'Lost', color: '#ef4444', leads: [] },
  ];

  constructor(
    private teamState: TeamState,
    private menuState: MenuState,
    private route: ActivatedRoute,
    private leadService: LeadService,
  ) {
    effect(() => {
      const id = this.deepLink.pendingLeadId();
      if (id) {
        this.openLeadFromUrl(id);
      }
    })
  }


  selectedProjects: LeadProject[] = [];

  editingProject: LeadProject | null = null;
  editingProjectNewDocs: ProjectDocument[] = [];
  isEditorDragOver = false;

  openProjectEditor(project: LeadProject): void {
    debugger;
    this.editingProject = {
      ...project,
      projectLeadId: "",
      projectType: "",
      startDate: project.startDate?.split('T')[0] ?? '',
      endDate: project.endDate?.split('T')[0] ?? '', documents: [...(project.documents ?? [])]
    };
    this.editingProjectNewDocs = [];
  }

  closeProjectEditor(): void {
    this.editingProject = null;
    this.editingProjectNewDocs = [];
  }

  onEditorFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) { this.addEditorFiles(Array.from(input.files)); input.value = ''; }
  }

  onEditorDragOver(event: DragEvent): void {
    event.preventDefault(); event.stopPropagation(); this.isEditorDragOver = true;
  }

  onEditorDragLeave(event: DragEvent): void {
    event.preventDefault(); event.stopPropagation(); this.isEditorDragOver = false;
  }

  onEditorDrop(event: DragEvent): void {
    event.preventDefault(); event.stopPropagation(); this.isEditorDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) this.addEditorFiles(Array.from(files));
  }

  private addEditorFiles(files: File[]): void {
    const MAX = 20 * 1024 * 1024;
    for (const file of files) {
      if (file.size > MAX) {
        this.toastService.error(`"${file.name}" exceeds 20 MB limit.`);
        continue;
      }
      if (!this.editingProjectNewDocs.some(d => d.name === file.name)) {
        this.editingProjectNewDocs.push({ name: file.name, size: file.size, file });
      }
    }
  }

  removeEditorNewDoc(index: number): void {
    this.editingProjectNewDocs.splice(index, 1);
  }

  removeEditorExistingDoc(docId: string): void {
    if (!this.editingProject) return;
    this.editingProject.documents = this.editingProject.documents.filter(d => d.id !== docId);
    // NOTE: this only removes it from the local editing copy — actual deletion
    // needs to be sent to the backend in saveProjectEdit(), see note below
  }


  saveProjectEdit() {
    debugger;
    if (!this.editingProject || !this.convertingLead) {
      return;
    }

    this.convertingLead.projects = this.convertingLead.projects.map(project =>
      project.id === this.editingProject!.id
        ? { ...this.editingProject! }
        : project
    );

    this.editingProject = null;
  }



  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.openLeadFromUrl(id);
      }

    });
    this.teamsService.connect({
      onLeadStatusChanged: (leadId, status) => this.applyLeadStatusChanged(leadId, status as LeadStatus),
      onLeadConverted: (leadId, status) => this.applyLeadConverted(leadId, status as LeadStatus)
    });
  }

  openLeadFromUrl(id: string) {
    const existing = this.leadList.find(l => l.id === id);
    if (existing) {
      this.openDetailModal(existing, false);
      this.deepLink.pendingLeadId.set(null);
    }
  }

  private applyLeadStatusChanged(leadId: string, status: LeadStatus): void {
    this.leadState.updateLead(leadId, { status });
  }

  private applyLeadConverted(leadId: string, status: LeadStatus): void {
    this.leadState.updateLead(leadId, { status });
  }


  get businessDepartment(): DepartmentItem | undefined {
    return this.globalState.departments().find(department => department.departmentKey == DepartmentKey.BUSINESS_MANAGEMENT);
  }

  get managerDepartment() {
    return this.globalState.departments().find(department => department.departmentKey == DepartmentKey.PROJECT_MANAGEMENT);

  }

  get teamMembers(): TeamMember[] {
    return this.teamState.teamMembers().filter(member => member.departmentId == this.businessDepartment!.id);
  }

  get projectManagers() {
    return this.teamState.teamMembers().filter(member => member.departmentId == this.managerDepartment!.id);
  }

  get leadList(): Lead[] {
    const userId = this.authState.userId();
    if (!userId) return [];
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
      const matchAssignee = !this.showOnlyMyLeads || lead.assignedToId === this.authState.userId();
      return matchText && matchStatus && matchSource && matchAssignee;
    });
  }



  toggleMyLeads(): void {
    this.showOnlyMyLeads = !this.showOnlyMyLeads;
  }


  getSourceOptionLabel(value: string): string {
    return leadSourceOptions.find(s => s.value == value)!.label ?? "Unknown";
  }

  getColumnLeads(status: LeadStatus): Lead[] {
    return this.filteredLeads.filter(l => l.status === status);
  }

  getColumnTotal(status: LeadStatus): number {
    return this.getColumnLeads(status).length;
  }

  // ── Reset helpers ──

  private resetNewLead(): CreateLeadDto {
    return {
      name: '',
      company: '',
      email: '',
      phone: '',
      source: 'Website',
      assignedToId: '',
      projectTitle: '',
      budget: null,
      projectType: '',
      dealStartDate: '',
      dealCloseDate: null,
    };
  }

  private resetProjectForm(): CreateProjectPayload {
    return {
      name: '',
      projectLeadId: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      leadId: '',
      documents: [],
    };
  }

  private resetClientForm(): CreateClientPayload {
    return { name: '', company: '', email: '', phone: '', leadId: '' };
  }







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
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone ?? '',
      source: lead.source as LeadSource,
      status: lead.status as LeadStatus,
      assignedToId: lead.assignedToId,
    };
    this.showEditModal = true;
  }

  formatBudgetDisplay(project: LeadProject): string {
    if (!project.budget) return '—';
    const formatted = `$${Number(project.budget).toLocaleString()}`;
    switch (project.projectType) {
      case 'Hourly': return `${formatted}/hr`;
      case 'ManMonth': return `${formatted}/mo`;
      default: return formatted;
    }
  }

  private openConversionFlow(lead: Lead, previousStatus: LeadStatus): void {
    if (lead.contactId) return;


    this.zone.run(() => {
      const primaryProject = lead.projects?.[0] ?? null;

      this.convertingLead = { ...lead };
      this.convertingLeadPreviousStatus = previousStatus;
      this.projectForm = {
        ...this.resetProjectForm(),
        leadId: lead.id,
        name: primaryProject?.name ?? '',
        startDate: primaryProject?.startDate ?? this.resetProjectForm().startDate,
        endDate: primaryProject?.endDate ?? null,
      };
      this.clientForm = {
        ...this.resetClientForm(),
        leadId: lead.id,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone ?? '',
      };
      this.conversionStep = 1;
      this.showConvertModal = true;
      this.cdr.detectChanges();
    });
  }

  submitEditLead(): void {
    if (!this.editLead.id) return;
    const { id, ...dto } = this.editLead;
    dto.dealCloseDate = dto.dealCloseDate ? dto.dealCloseDate : null;
    dto.budget = Number(dto.budget?.toFixed(2));
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


  openDetailModal(lead: Lead, updateUrl = true) {
    this.detailLead = lead;
    this.showDetailModal = true;
    if (updateUrl) {
      this.location.go(`/dashboard/lead/${lead.id}`);
    }
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.detailLead = null;
    if (this.location.path().includes('/lead/')) {
      this.location.go('/dashboard');
    }
  }


  deleteLead(id: string): void {
    this.menuState.open({
      title: 'Delete Lead',
      message: 'Are you sure you want to delete this lead? This action cannot be undone.',
      onConfirm: () => {
        this.leadService.handleRemoveLead(id).subscribe({
          next: () => { this.leadState.removeLead(id); },
          error: (err) => console.error('Failed to delete lead', err),
        });
      },
    });
  }


  setStatus(lead: Lead, status: LeadStatus): void {
    this.openStatusIndex = null;
    this.moveLeadToStatus(lead, status);
  }

  setAssignee(lead: Lead, memberId: string): void {
    const memberName = this.teamMembers.find(m => m.id === memberId)?.name ?? '';
    this.menuState.open({
      title: 'Assign Lead',
      message: `Are you sure to assign this lead to ${memberName}?`,
      onConfirm: () => {
        const prev = { assignedToId: lead.assignedToId, assignedToName: lead.assignedToName };
        lead.assignedToId = memberId;
        lead.assignedToName = memberName;
        this.leadService.handleUpdateLead(lead.id, { assignedToId: memberId }).subscribe({
          next: () => {
            this.leadState.updateLead(lead.id, { assignedToId: memberId });
            this.openAssigneeIndex = null;
          },
          error: (err) => {
            lead.assignedToId = prev.assignedToId;
            lead.assignedToName = prev.assignedToName;
            this.openAssigneeIndex = null;
            console.error(err);
          },
        });
      },
    });
  }


  dragLead(event: DragEvent, lead: Lead, status: LeadStatus): void {
    this.draggedLead = lead;
    this.draggedFromStatus = status;
  }

  allowDrop(event: DragEvent): void { event.preventDefault(); }

  dropLead(event: DragEvent, targetStatus: LeadStatus): void {
    event.preventDefault();
    if (!this.draggedLead || this.draggedFromStatus === targetStatus) return;
    this.moveLeadToStatus(this.draggedLead, targetStatus);
    this.draggedLead = null;
    this.draggedFromStatus = null;
  }

  moveLeadLeft(lead: Lead): void {
    const order: LeadStatus[] = ['Contracted', 'Qualified', 'Converted', 'Lost'];
    const idx = order.indexOf(lead.status as LeadStatus);
    if (idx <= 0) return;
    this.moveLeadToStatus(lead, order[idx - 1]);
  }

  moveLeadRight(lead: Lead): void {
    const order: LeadStatus[] = ['Contracted', 'Qualified', 'Converted', 'Lost'];
    const idx = order.indexOf(lead.status as LeadStatus);
    if (idx >= order.length - 1) return;
    this.moveLeadToStatus(lead, order[idx + 1]);
  }


  nextStep(status: string): string {
    switch (status) {
      case "Contracted": return "Move to Qualified";
      case "Qualified": return "Move to Converted";
      case "Converted": return "Move to Done";
      case "Lost": return "Already Lost";
      default: return "";
    }
  }

  previousStep(status: string): string {
    switch (status) {
      case "Contracted": return "Already in Contacted";
      case "Qualified": return "Move to  Contracted";
      case "Converted": return "Move to Qualified";
      case "Lost": return "Move to Converted";
      default: return "";
    }
  }


  private moveLeadToStatus(lead: Lead, newStatus: LeadStatus): void {
    if (lead.status === newStatus) return;

    if (lead.status == "Converted" || lead.status == "Lost") {
      this.toastService.error(`Can't Move the lead from ${lead.status} Status!`);
      return;
    }

    if (newStatus === 'Converted' && !lead.contactId) {
      this.menuState.open({
        title: 'Convert Lead',
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
      title: 'Move Lead',
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

  submitConversion(): void {
    if (!this.clientForm.name || !this.clientForm.company || !this.clientForm.email) {
      this.toastService.error('Client name, company and email are required.');
      return;
    }

    if (!this.convertingLead) return;

    const formData = new FormData();
    formData.append('name', this.projectForm.name);
    formData.append('projectLeadId', this.projectForm.projectLeadId);

    if (this.projectForm.description) {
      formData.append('description', this.projectForm.description);
    }

    if (this.projectForm.startDate) {
      formData.append('startDate', this.projectForm.startDate);
    }

    if (this.projectForm.endDate) {
      formData.append('endDate', this.projectForm.endDate);
    }

    this.projectForm.documents.forEach(doc =>
      formData.append('documents', doc.file, doc.name)
    );

    const leadId = this.convertingLead.id;
    const leadName = this.convertingLead.name;
    const projectName = this.projectForm.name;
    const previousStatus = this.convertingLeadPreviousStatus;

    this.loader.show('Converting lead...', 'lg');
    this.contactService.createContact(this.clientForm)
      .pipe(
        switchMap((contact) => {
          this.contactState.addContact(contact);
          return this.leadService.handleUpdateLead(leadId, {
            status: 'Converted',
            contactId: contact.id
          }).pipe(map(() => contact));
        }),

        switchMap((contact) => {
          formData.append('contactId', contact.id);
          this.leadState.updateLead(leadId, { contactId: contact.id });
          return this.projectService.createProject(formData);
        })
      )
      .subscribe({
        next: () => {
          this.loader.hide();
          this.toastService.success(`Lead "${leadName}" successfully converted to client and project "${projectName}" created.`);
          this._closeConvertModalAndReset();
        },

        error: (err) => {
          this.loader.hide();

          this.toastService.error('Conversion failed. Please try again.');

          if (previousStatus) {
            this.leadState.updateLead(leadId, {
              status: previousStatus
            });
          }

          this._closeConvertModalAndReset();
          console.error(err);
        }
      });
  }


  private _closeConvertModalAndReset(): void {
    this.showConvertModal = false;
    this.conversionStep = 1;
    this.convertingLead = null;
    this.convertingLeadPreviousStatus = null;
    this.projectForm = this.resetProjectForm();
    this.clientForm = this.resetClientForm();
    this.cdr.detectChanges();
  }


  openHistory(lead: Lead) {
    this.history.open('Lead', lead.id, lead.name);
  }

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
      case 'pdf': return 'fa-file-pdf';
      case 'doc': case 'docx': return 'fa-file-word';
      case 'xls': case 'xlsx': return 'fa-file-excel';
      case 'png': case 'jpg': case 'jpeg':
      case 'gif': case 'webp': return 'fa-file-image';
      case 'zip': case 'rar': return 'fa-file-archive';
      default: return 'fa-file-alt';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ── Search / helpers ──

  onSearch(value: string): void { this.searchText = value; }

  statusClass(status: string): string { return status.toLowerCase(); }

  toggleStatus(index: number): void {
    this.openStatusIndex = this.openStatusIndex === index ? null : index;
    this.openAssigneeIndex = null;
  }

  toggleAssignee(index: number): void {
    this.openAssigneeIndex = this.openAssigneeIndex === index ? null : index;
    this.openStatusIndex = null;
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

  hasDealInfo(lead: any): boolean {
    return !!(lead?.projectTitle || lead?.budget || lead?.projectType || lead?.dealStartDate || lead?.dealCloseDate);
  }

















  showProjectsPanel = false;
  projectsPanelLead: Lead | null = null;
  projectsPanelMode: 'list' | 'create' = 'list';
  newProjectForm: CreateProjectForLeadPayload = this.resetNewProjectForm();


  private resetNewProjectForm(): CreateProjectForLeadPayload {
    return {
      name: '',
      projectType: '',
      budget: null,
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      leadId: '',
    };
  }



  formatProjectBudget(project: LeadProject): string {
    if (!project.budget) return '—';
    const formatted = `$${Number(project.budget).toLocaleString()}`;
    switch (project.projectType) {
      case 'Hourly': return `${formatted}/hr`;
      case 'ManMonth': return `${formatted}/mo`;
      default: return formatted;
    }
  }

  getProjectTypeClass(type: ProjectType | '' | undefined): string {
    switch (type) {
      case 'Hourly': return 'hourly';
      case 'FixedPrice': return 'fixed-price';
      case 'ManMonth': return 'man-month';
      default: return '';
    }
  }

  // ── Projects side panel ──

  openProjectsPanel(lead: Lead): void {
    this.projectsPanelLead = lead;
    this.projectsPanelMode = 'list';
    this.showProjectsPanel = true;
  }

  closeProjectsPanel(): void {
    this.showProjectsPanel = false;
    setTimeout(() => {
      this.projectsPanelLead = null;
      this.projectsPanelMode = 'list';
      this.newProjectForm = this.resetNewProjectForm();
    }, 250); // matches slide-out transition duration, avoids content flash before it's fully offscreen
  }

  openCreateProjectForm(): void {
    if (!this.projectsPanelLead) return;
    this.newProjectForm = { ...this.resetNewProjectForm(), leadId: this.projectsPanelLead.id };
    this.projectsPanelMode = 'create';
  }

  cancelCreateProject(): void {
    this.projectsPanelMode = 'list';
    this.newProjectForm = this.resetNewProjectForm();
  }

  submitNewProject(): void {
    if (!this.newProjectForm.name || !this.projectsPanelLead) {
      this.toastService.error('Project name is required.');
      return;
    }

    this.loader.show('Creating project...', 'md');

    this.leadService.handleUpdateLead(this.projectsPanelLead.id, {
      projectTitle: this.newProjectForm.name,
      projectType: this.newProjectForm.projectType || null,
      budget: this.newProjectForm.budget,
      dealStartDate: this.newProjectForm.startDate,
      dealCloseDate: this.newProjectForm.endDate,
    } as UpdateLeadDto).subscribe({
      next: (updated) => {
        this.loader.hide();
        this.leadState.updateLead(this.projectsPanelLead!.id, { projects: updated.projects });
        this.projectsPanelLead = { ...this.projectsPanelLead!, projects: updated.projects };
        if (this.detailLead?.id === this.projectsPanelLead!.id) {
          this.detailLead = { ...this.detailLead, projects: updated.projects };
        }
        this.toastService.success('Project added successfully!');
        this.projectsPanelMode = 'list';
        this.newProjectForm = this.resetNewProjectForm();
      },
      error: (err) => {
        this.loader.hide();
        this.toastService.error('Failed to create project.');
        console.error(err);
      },
    });
  }

  getBudgetLabel(projectType: ProjectType | '' | undefined): string {
    switch (projectType) {
      case 'Hourly': return 'Hourly Rate ($/hr)';
      case 'ManMonth': return 'Monthly Rate ($/month)';
      default: return 'Budget ($)';
    }
  }

  getBudgetPlaceholder(projectType: ProjectType | '' | undefined): string {
    switch (projectType) {
      case 'Hourly': return 'e.g. 75';
      case 'ManMonth': return 'e.g. 5000';
      default: return 'e.g. 10000';
    }
  }
}
