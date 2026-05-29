import { Component, Input, OnInit, signal } from '@angular/core';
import { CreateLeadDto, LeadResponseDto, LeadSource, LeadStatus, UpdateLeadDto } from '../../../core/types/lead.type';
import { TeamMember } from '../../../core/types/global.type';
import { AuthState } from '../../../state/auth.state';
import { LeadService } from '../../../services/lead.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lead-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './lead-mangement.component.html',
  styleUrls: ['./lead-mangement.component.css']
})
export class LeadManagementComponent {

  @Input() leads: LeadResponseDto[] = [];

  showCreateModal = false;
  showEditModal = false;

  openStatusIndex: number | null = null;
  openAssigneeIndex: number | null = null;


  editLead: Partial<UpdateLeadDto & { id: string }> = {};

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
    private leadService: LeadService
  ) { }


  get teamMembers(): TeamMember[] {
    return this.authState.teamMembers().filter(m => m.role !== 'Admin');
  }

  submitCreateLead(): void {
    debugger;
    if (!this.newLead.name || !this.newLead.company || !this.newLead.email) return;

    this.leadService.handleCreateLead(this.newLead).subscribe({
      next: (created) => {
        this.leads = [created, ...this.leads];
        this.showCreateModal = false;
        this.resetNewLead();
      },
      error: (err) => console.error('Failed to create lead', err)
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


  setStatus(lead: LeadResponseDto, status: LeadStatus): void {
    const previous = lead.status;
    lead.status = status;
    this.openStatusIndex = null;

    const dto: UpdateLeadDto = { status };

    this.leadService.handleUpdateLead(lead.id, dto).subscribe({
      next: (updated) => {
        const index = this.leads.findIndex(l => l.id === lead.id);
        if (index !== -1) this.leads[index] = updated;
      },
      error: (err) => {
        lead.status = previous; // rollback
        console.error('Failed to update status', err);
      }
    });
  }


  setAssignee(lead: LeadResponseDto, memberId: string): void {
    const previousId = lead.assignedToId;
    const previousName = lead.assignedToName;

    lead.assignedToId = memberId;
    lead.assignedToName = this.teamMembers.find(m => m.id === memberId)?.name ?? '';
    this.openAssigneeIndex = null;

    const dto: UpdateLeadDto = { assignedToId: memberId };

    this.leadService.handleUpdateLead(lead.id, dto).subscribe({
      next: (updated) => {
        const index = this.leads.findIndex(l => l.id === lead.id);
        if (index !== -1) this.leads[index] = updated;
      },
      error: (err) => {
        lead.assignedToId = previousId;
        lead.assignedToName = previousName;
        console.error('Failed to update assignee', err);
      }
    });
  }


  openEditModal(lead: LeadResponseDto): void {
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
      next: (updated) => {
        const index = this.leads.findIndex(l => l.id === id);
        if (index !== -1) this.leads[index] = updated;
        this.showEditModal = false;
        this.editLead = {};
      },
      error: (err) => console.error('Failed to update lead', err)
    });
  }


  deleteLead(id: string): void {
    this.leadService.handleRemoveLead(id).subscribe({
      next: () => {
        this.leads = this.leads.filter(l => l.id !== id);
      },
      error: (err) => console.error('Failed to delete lead', err)
    });
  }


  onSearch(value: string): void {
    if (!value.trim()) {
      return;
    }

    this.leadService.handleSearchLead(value).subscribe({
      next: (results) => this.leads = results,
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