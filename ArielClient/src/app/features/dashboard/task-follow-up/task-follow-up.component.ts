import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeadState } from '../../../state/lead.state';
import { DealState } from '../../../state/deal.state';
import { AuthState } from '../../../state/auth.state';
import {
  CrmTaskService,
  CrmTaskDto,
  CreateCrmTaskDto,
} from '../../../services/crm-task.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { MenuState } from '../../../state/menu.state';

const TASK_TYPE_MAP: Record<string, number> = {
  'Call Outreach': 0,
  'Email Campaign': 1,
  'Meeting discovery': 2,
  'Technical Demo': 3,
};

@Component({
  selector: 'app-task-follow-up',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-follow-up.component.html',
  styleUrl: './task-follow-up.component.css',
})
export class TasksFollowupsComponent implements OnInit {
  private crmTaskService = inject(CrmTaskService);
  leadState = inject(LeadState);
  dealState = inject(DealState);
  authState = inject(AuthState);
  toast = inject(ToastService);
  loader = inject(LoaderService);
  menuState = inject(MenuState);

  activeTab: 'pending' | 'completed' | 'all' = 'all';
  showCreateModal = false;
  errorMsg: string | null = null;

  tasks = signal<CrmTaskDto[]>([]);

  newTask: {
    title: string;
    dueDate: string;
    type: string;
    assignedTo: string | null;
    leadId: string | null;
    dealId: string | null;
  } = this.blankTask();




  get teamMembers() { return this.authState.teamMembers().filter(member => member.role != "Admin"); }
  get leads() { return this.leadState.leads(); }
  get deals() { return this.dealState.deals(); }


  ngOnInit(): void {
    this.loadTasks();
  }


  private loadTasks(): void {
    this.errorMsg = null;
    this.loader.show('Loading Tasks...', 'md');

    this.crmTaskService.getAll().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.loader.hide();
      },
      error: (err) => {
        this.loader.hide();
        this.toast.error('Failed to load tasks.');
        this.errorMsg = 'Failed to load tasks. Please try again.';
      },
    });
  }


  filteredTasks(): CrmTaskDto[] {
    const all = this.tasks();

    if (this.activeTab === 'pending') return all.filter(t => t.status === 'Pending');
    if (this.activeTab === 'completed') return all.filter(t => t.status === 'Completed');
    return all;
  }


  openCreateModal(): void {
    this.newTask = this.blankTask();
    this.showCreateModal = true;
  }

  closeModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showCreateModal = false;
    }
  }

  onLeadSelect(value: string | null): void {
    if (value) this.newTask.dealId = null;
  }

  onDealSelect(value: string | null): void {
    if (value) this.newTask.leadId = null;
  }


  submitTask(): void {
    if (!this.newTask.title.trim() || !this.newTask.type || !this.newTask.assignedTo || !this.newTask.dueDate) {
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }

    this.loader.show("Adding New Task...", 'lg');
    const dto: CreateCrmTaskDto = {
      title: this.newTask.title.trim(),
      type: TASK_TYPE_MAP[this.newTask.type] ?? 0,
      dueDate: this.newTask.dueDate,
      assignedToId: this.newTask.assignedTo,
      leadId: this.newTask.leadId,
      dealId: this.newTask.dealId,
    };

    this.errorMsg = null;

    this.crmTaskService.create(dto).subscribe({
      next: (created) => {
        this.tasks.update(prev => [created, ...prev]);
        this.showCreateModal = false;

        this.loader.hide();
        this.toast.success('Task created successfully.');
      },

      error: (err) => {
        this.loader.hide();
        this.toast.error('Failed to create task.');
      }
    });
  }

  deleteTask(id: string): void {

    this.menuState.open({
      title: 'Task Remove',
      message: `Are you sure to Remove this Task ?`,

      onConfirm: () => {

        this.loader.show('Deleting Task...', 'md');

        this.crmTaskService.delete(id).subscribe({
          next: () => {
            this.tasks.update(prev => prev.filter(t => t.id !== id));

            this.loader.hide();
            this.toast.success('Task deleted successfully.');
          },
          error: () => {
            this.loader.hide();
            this.toast.error('Failed to delete task.');
          },
        });

      }
    });
  }

  toggleTask(task: CrmTaskDto, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const previousStatus = task.status;
    const newStatus = previousStatus === 'Pending' ? 'Completed' : 'Pending';

    this.menuState.open({
      title: 'Update Task Status',
      message: `Are you sure you want to mark "${task.title}" as ${newStatus}?`,

      onConfirm: () => {

        this.loader.show('Updating Task Status...', 'md');

        const updated: CrmTaskDto = {
          ...task,
          status: newStatus,
        };

        this.tasks.update(prev =>
          prev.map(t => t.id === task.id ? updated : t)
        );

        this.crmTaskService.updateStatus(updated.id, updated.status).subscribe({
          next: () => {
            this.loader.hide();
            this.toast.success(`Task marked as ${newStatus}.`);
          },
          error: () => {
            this.loader.hide();

            this.tasks.update(prev =>
              prev.map(t => t.id === task.id ? task : t)
            );

            this.toast.error('Failed to update task status.');
          }
        });
      },

      onCancel: () => {
        checkbox.checked = previousStatus === 'Completed';
      }
    });
  }

  private blankTask() {
    return {
      title: '',
      dueDate: '',
      type: '',
      assignedTo: null as string | null,
      leadId: null as string | null,
      dealId: null as string | null,
    };
  }

  isCompleted(task: CrmTaskDto): boolean {
    return task.status === 'Completed';
  }

  contextLabel(task: CrmTaskDto): string {
    if (task.leadName) return `Lead: ${task.leadName}`;
    if (task.dealTitle) return `Deal: ${task.dealTitle}`;
    return '—';
  }
}