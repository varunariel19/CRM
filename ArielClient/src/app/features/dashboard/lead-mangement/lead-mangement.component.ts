import { Component, inject } from '@angular/core';
import { CreateLeadDto, Lead, LeadSource, LeadStatus, UpdateLeadDto } from '../../../core/types/lead.type';
import { TeamMember } from '../../../core/types/global.type';
import { AuthState } from '../../../state/auth.state';
import { LeadService } from '../../../services/lead.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuState } from '../../../state/menu.state';
import { LeadState } from '../../../state/lead.state';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-lead-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './lead-mangement.component.html',
  styleUrls: ['./lead-mangement.component.css']
})
export class LeadManagementComponent {

  leadState = inject(LeadState);
  toastService = inject(ToastService);
  private loader = inject(LoaderService);
  showCreateModal = false;
  showEditModal = false;
  editLead: Partial<UpdateLeadDto & { id: string }> = {};

  openStatusIndex: number | null = null;
  openAssigneeIndex: number | null = null;

  newLead: CreateLeadDto = {
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'Website',
    assignedToId: ''
  };

  readonly statusOptions: {
    label: LeadStatus;
    value: LeadStatus;
    className: string;
  }[] = [
      {
        label: 'New',
        value: 'New',
        className: 'new',
      },
      {
        label: 'Contracted',
        value: 'Contracted',
        className: 'contracted',
      },
      {
        label: 'Qualified',
        value: 'Qualified',
        className: 'qualified',
      },
      {
        label: 'Converted',
        value: 'Converted',
        className: 'converted',
      },
      {
        label: 'Lost',
        value: 'Lost',
        className: 'lost',
      },
    ];

  readonly sourceOptions: LeadSource[] = [
    'Website', 'Referral', 'Instagram', 'ColdCall'
  ];

  constructor(
    private authState: AuthState,
    private menuState: MenuState,
    private leadService: LeadService
  ) { }


  get teamMembers(): TeamMember[] {
    return this.authState.teamMembers().filter(m => m.role !== 'Admin');
  }

  get leadList(): Lead[] {
    return this.leadState.leads();
  }

  submitCreateLead(): void {
    if (!this.newLead.name || !this.newLead.company || !this.newLead.email) return;

    this.loader.show('Creating Lead...', 'lg');

    this.leadService.handleCreateLead(this.newLead).subscribe({
      next: (created) => {
        this.leadState.addLead(created);
        this.showCreateModal = false;
        this.resetNewLead();
        this.loader.hide();
        this.toastService.success("New lead added successfully!", "New Lead");
      },
      error: (err) => {
        this.loader.hide();
        this.toastService.error("Failed to create new lead");
        console.error('Failed to create lead', err)
      }
    });
  }

  private resetNewLead(): void {
    this.newLead = {
      name: '',
      company: '',
      email: '',
      phone: '',
      source: 'Website',
      assignedToId: ''
    };
  }


  setStatus(lead: Lead, status: LeadStatus): void {

    this.menuState.open({
      title: 'Change Lead Status',
      message: `Are you sure you want to change the status to "${status}"?`,

      onConfirm: () => {
        const prevStatus = lead.status;
        const dto: UpdateLeadDto = { status };

        this.leadService.handleUpdateLead(lead.id, dto).subscribe({
          next: () => {
            this.leadState.updateLead(lead.id, dto);
            this.toastService.info(`Lead Status updated to ${status}`);
            this.openStatusIndex = null;

          },

          error: (err) => {
            lead.status = prevStatus;
            this.openStatusIndex = null;
            console.error('Failed to update status', err);
          }
        });

      }
    });

  }


  setAssignee(lead: Lead, memberId: string): void {

    const memberName = this.teamMembers.find(m => m.id === memberId)?.name ?? '';

    this.menuState.open({
      title: 'Assign Lead',
      message: `Are you sure to Assign this lead to ${memberName}?`,

      onConfirm: () => {

        const previousId = lead.assignedToId;
        const previousName = lead.assignedToName;

        lead.assignedToId = memberId;
        lead.assignedToName = memberName;

        const dto: UpdateLeadDto = {
          assignedToId: memberId
        };

        this.leadService.handleUpdateLead(lead.id, dto).subscribe({
          next: () => {
            this.leadState.updateLead(lead.id, dto);
            this.openAssigneeIndex = null;
          },

          error: (err) => {
            lead.assignedToId = previousId;
            lead.assignedToName = previousName;
            this.openAssigneeIndex = null;
            console.error(
              'Failed to update assignee',
              err
            );
          }
        });

      }
    });

  }


  openEditModal(lead: Lead): void {
    this.editLead = {
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone ?? '',
      source: lead.source as LeadSource,

      status: lead.status as LeadStatus,
      assignedToId: lead.assignedToId
    };
    this.showEditModal = true;
  }

  submitEditLead(): void {
    if (!this.editLead.id) return;

    const { id, ...dto } = this.editLead;

    this.leadService.handleUpdateLead(id, dto as UpdateLeadDto).subscribe({
      next: () => {
        this.leadState.updateLead(id, this.editLead);
        this.showEditModal = false;
        this.editLead = {};
      },
      error: (err) => console.error('Failed to update lead', err)
    });
  }


  deleteLead(id: string): void {

    this.menuState.open({
      title: 'Delete Lead',
      message: 'Are you sure you want to delete this lead? This action cannot be undone.',

      onConfirm: () => {

        this.leadService.handleRemoveLead(id).subscribe({
          next: () => {
            this.leadState.removeLead(id);
          },

          error: (err) => {
            console.error(
              'Failed to delete lead',
              err
            );
          }
        });

      }
    });

  }


  onSearch(value: string): void {
    if (!value.trim()) {
      return;
    }

    this.leadService.handleSearchLead(value).subscribe({
      next: (results) => this.leadState.setLeads(results),
      error: (err) => console.error('Search failed', err)
    });
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


  statusClass(status: string): string {
    return status.toLowerCase();
  }

  toggleStatus(index: number): void {
    this.openStatusIndex = this.openStatusIndex === index ? null : index;
    this.openAssigneeIndex = null;
  }

  toggleAssignee(index: number): void {
    this.openAssigneeIndex = this.openAssigneeIndex === index ? null : index;
    this.openStatusIndex = null;
  }

  getAssigneeName(memberId: string): string {
    return this.teamMembers.find(m => m.id === memberId)?.name ?? 'Select member';
  }
}