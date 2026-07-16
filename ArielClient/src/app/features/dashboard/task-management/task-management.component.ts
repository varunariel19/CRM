import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskColumn, TaskManagementState, TaskMember } from '../../../state/task-management.state';
import { ViewTicketComponent } from '../../../components/view-ticket/view-ticket.component';
import { ProjectState } from '../../../state/project.state';
import { ProjectMember } from '../projects/projects.component';
import {
  CreateTaskRequest,
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
  TaskManageService,
  UpdateTaskRequest,
} from '../../../services/task-management.service';
import { finalize } from 'rxjs';
import { AuthState } from '../../../state/auth.state';
import { LoaderService } from '../../../core/services/loader.service';
import { ToastService } from '../../../core/services/toast.service';
import { PermissionFacade } from '../../../core/services/permissionFacade.service';
import { DeepLinkService } from '../../../core/services/deepLink.service';
import { UserProfileComponent } from '../../../components/items/user-profile/user-profile.component';
import { TeamsService } from '../../../services/teams.service';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewTicketComponent, UserProfileComponent],
  templateUrl: './task-management.component.html',
  styleUrl: './task-management.component.css',
})
export class TaskManagementComponent implements OnInit {

  taskState = inject(TaskManagementState);
  projectState = inject(ProjectState);
  authState = inject(AuthState);
  taskService = inject(TaskManageService);
  loader = inject(LoaderService);
  toast = inject(ToastService);
  perm = inject(PermissionFacade);
  private deepLink = inject(DeepLinkService);
  private location = inject(Location);
  teamsService = inject(TeamsService);

  readonly currentUserId = this.authState.userId();

  allTasks = signal<Task[]>([]);
  allMembers: ProjectMember[] = [];

  isLoading = signal(false);
  isSubmitting = signal(false);
  isDeleting = signal<string | null>(null);

  readonly columns: TaskColumn[] = this.taskState.columns();
  readonly priorities: TaskPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  readonly types: TaskType[] = ['FEATURE', 'BUG', 'TASK', 'CHORE'];
  readonly statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  selectedProjectId = signal('');
  selectedMemberId = signal('');
  filterByMe = signal(false);
  selectedPriority = signal('');
  assignee: ProjectMember[] = [];



  showCreateModal = false;
  showEditModal = false;
  showTicketModal = false;
  selectedTicket: Task | null = null;
  newTask: CreateTaskRequest = this.resetForm();
  editTask: (Task & { assignToId: string }) | null = null;


  draggedTask: Task | null = null;
  draggedFrom = '';

  constructor() {
    effect(() => {
      const loaded = this.projectState.loaded();
      if (loaded) {
        this.loadTasks();
      }
    });

    effect(() => {
      const taskId = this.deepLink.pendingTaskId();
      const projectsLoaded = this.projectState.loaded();

      if (taskId && projectsLoaded) {
        this.openTaskFromUrl(taskId);
      }
    });
  }


  ngOnInit(): void {
    this.teamsService.connect({
      onTaskStatusChanged: (taskId: string, status: TaskStatus) => this.applyTaskStatusChange(taskId, status)
    });
    const since = this.taskState.getSinceTime();
    if (since != null) {
      this.taskService.getChanges(since).subscribe({
        next: (tasks) => this.applyTaskChanges(tasks),
        error: (err) => console.error('Failed to fetch task changes', err),
      });
    }
  }

  private applyTaskChanges(tasks: Task[]): void {
    if (!tasks?.length) return;

    this.allTasks.update((list) => {
      const byId = new Map(list.map((t) => [t.taskId, t]));
      for (const updated of tasks) {
        byId.set(updated.taskId, updated);
      }
      return Array.from(byId.values());
    });

    const maxUpdatedAt = tasks.reduce(
      (max, t) => (new Date(t.updatedAt) > max ? new Date(t.updatedAt) : max),
      new Date(0)
    );
    this.taskState.setSinceTime(maxUpdatedAt);
  }


  private applyTaskStatusChange(taskId: string, newStatus: TaskStatus) {
    this.allTasks.update((list) =>
      list.map((t) => (t.taskId === taskId ? { ...t, status: newStatus } : t))
    );
  }


  handleSelectProject(event: Event) {
    const projectId = (event.target as HTMLSelectElement).value;
    this.newTask.projectId = projectId;
    this.newTask.assignToId = '';

    const proj = this.allProjects.find((p) => p.id === projectId);
    this.assignee = proj ? proj.members : [];
  }

  handleFilterByMe() {
    this.filterByMe.set(!this.filterByMe());
  }

  loadTasks(): void {
    this.isLoading.set(true);
    const taskList = this.allProjects.flatMap(project => project.tasks);
    this.allTasks.set(taskList);
    this.isLoading.set(false);
  }

  submitTask(): void {
    if (!this.newTask.title.trim() || !this.newTask.assignToId || !this.newTask.projectId) {
      alert('Title, Project, and Assignee are required.');
      return;
    }

    this.isSubmitting.set(true);
    this.taskService.createTask(this.newTask)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
  next: (res) => {
          if (res.success) {
            this.taskState.addTask(res.task);
            this.allTasks.update(list => [...list, res.task]); 
            this.showCreateModal = false;
            this.newTask = this.resetForm();
          }
        },
        error: (err) => console.error('Failed to create task', err),
      });
  }

  submitEdit(): void {
    if (!this.editTask) return;

    const payload: UpdateTaskRequest = {
      title: this.editTask.title,
      description: this.editTask.description,
      priority: this.editTask.priority,
      type: this.editTask.type,
      status: this.editTask.status,
      assignToId: this.editTask.assignToId ?? '',
    };

    this.isSubmitting.set(true);
    this.taskService.updateTask(this.editTask.taskId, payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.allTasks.update((list) =>
              list.map((t) => (t.taskId === this.editTask!.taskId ? { ...t, ...this.editTask! } : t))
            );
            this.showEditModal = false;
            this.editTask = null;
          }
        },
        error: (err) => console.error('Failed to update task', err),
      });
  }

  deleteTask(taskId: string): void {
    if (!confirm('Delete this task? This cannot be undone.')) return;

    this.isDeleting.set(taskId);
    this.taskService.deleteTask(taskId)
      .pipe(finalize(() => this.isDeleting.set(null)))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.allTasks.update((list) => list.filter((t) => t.taskId !== taskId));
          }
        },
        error: (err) => console.error('Failed to delete task', err),
      });
  }



  dragTask(event: DragEvent, task: Task, colKey: string): void {
    this.draggedTask = task;
    this.draggedFrom = colKey;
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  dropTask(event: DragEvent, targetKey: string): void {
    event.preventDefault();
    if (!this.draggedTask || this.draggedFrom === targetKey) return;
    this.moveTaskToStatus(this.draggedTask, targetKey as TaskStatus);
    this.draggedTask = null;
    this.draggedFrom = '';
  }

  moveLeft(event: Event, colKey: string, task: Task): void {
    event.preventDefault();
    event.stopPropagation();
    const idx = this.columns.findIndex((c) => c.key === colKey);
    if (idx > 0) this.moveTaskToStatus(task, this.columns[idx - 1].key as TaskStatus);
  }

  moveRight(event: Event, colKey: string, task: Task): void {
    event.preventDefault();
    event.stopPropagation();
    const idx = this.columns.findIndex((c) => c.key === colKey);
    if (idx < this.columns.length - 1)
      this.moveTaskToStatus(task, this.columns[idx + 1].key as TaskStatus);
  }

  private moveTaskToStatus(task: Task, status: TaskStatus): void {
    // optimistic UI update
    this.allTasks.update((list) =>
      list.map((t) => (t.taskId === task.taskId ? { ...t, status } : t))
    );

    const payload: UpdateTaskRequest = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      type: task.type,
      status,
      assignToId: task.assignee.id ?? '',
    };

    this.taskService.updateTask(task.taskId, payload).subscribe({
      error: (err) => {
        console.error('Failed to move task, reverting', err);
        // revert on failure
        this.allTasks.update((list) =>
          list.map((t) => (t.taskId === task.taskId ? { ...t, status: task.status } : t))
        );
      },
    });
  }


  nextStep(status: string): string {
    switch (status) {
      case "TODO": return "Move to In Progress";
      case "IN_PROGRESS": return "Move to Review";
      case "REVIEW": return "Move to Done";
      case "DONE": return "Already Done";
      default: return "";
    }
  }

  previousStep(status: string): string {
    switch (status) {
      case "DONE": return "Move to Review";
      case "REVIEW": return "Move to In Progress";
      case "IN_PROGRESS": return "Move to To Do";
      case "TODO": return "Already at To Do";
      default: return "";
    }
  }

  get allProjects() { return this.projectState.projects(); }


  get projectMembers(): TaskMember[] {
    const pid = this.selectedProjectId();
    if (!pid) return [];
    const proj = this.allProjects.find((p) => p.id === pid);
    this.allMembers = proj ? proj.members : [];
    return proj ? proj.members : [];
  }

  get filteredTasks(): Task[] {
    let tasks = this.allTasks();
    const pid = this.selectedProjectId();
    if (pid) tasks = tasks.filter((t) => t.projectId === pid);
    if (this.filterByMe()) {
      tasks = tasks.filter((t) => t.assignee.id === this.currentUserId);
    } else {
      const mid = this.selectedMemberId();
      if (mid) tasks = tasks.filter((t) => t.assignee.id === mid);
    }
    const prio = this.selectedPriority();
    if (prio) tasks = tasks.filter((t) => t.priority === prio);
    return tasks;
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.selectedProjectId() ||
      this.selectedMemberId() ||
      this.filterByMe() ||
      this.selectedPriority()
    );
  }

  getColumnTasks(s: TaskStatus): Task[] {
    return this.filteredTasks.filter((t) => t.status === s);
  }

  onProjectChange(): void { this.selectedMemberId.set(''); }


  canEditAsAssignee(task: Task | null | undefined) {
    return task?.assignee?.id === this.authState.userId();
  }

  clearFilters(): void {
    this.selectedProjectId.set('');
    this.selectedMemberId.set('');
    this.filterByMe.set(false);
    this.selectedPriority.set('');
  }

  projectName(id: string): string {
    return this.allProjects.find((p) => p.id === id)?.name ?? '—';
  }

  initials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  priorityMeta(p: TaskPriority) {
    return {
      CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '🔴' },
      HIGH: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: '▲' },
      MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '◈' },
      LOW: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '▽' },
    }[p];
  }

  typeMeta(t: TaskType) {
    return {
      FEATURE: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      BUG: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      TASK: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
      CHORE: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    }[t];
  }


  openEditModal(event: Event, task: Task): void {
    event.stopPropagation();
    event.preventDefault();
    this.editTask = { ...task, assignToId: task.assignee.id ?? '' };
    const proj = this.allProjects.find((p) => p.id === task.projectId);
    this.assignee = proj ? proj.members : [];
    this.showEditModal = true;
  }

  viewTicket(task: Task, updateUrl = true): void {
    this.selectedTicket = { ...task, assignee: { ...task.assignee }, reporter: { ...task.reporter } };
    this.showTicketModal = true;
    const proj = this.allProjects.find((p) => p.id === task.projectId);
    this.assignee = proj ? proj.members : [];
    if (updateUrl) {
      this.location.go(`/dashboard/task-management/${task.taskId}`);
    }
  }

  updateTicketFromView(ticket: Task): void {
    const previousTicket = this.allTasks().find((t) => t.taskId === ticket.taskId);
    if (!previousTicket) return;

    const updatedTicket = {
      ...previousTicket,
      ...ticket,
      assignee: { ...ticket.assignee },
      reporter: { ...ticket.reporter },
    };

    const payload: UpdateTaskRequest = {
      title: updatedTicket.title,
      description: updatedTicket.description,
      priority: updatedTicket.priority,
      type: updatedTicket.type,
      aiSummary: updatedTicket.aiSummary ?? [],
      status: updatedTicket.status,
      assignToId: updatedTicket.assignee.id ?? '',
    };

    this.loader.show('Updating ticket...', 'md');
    this.taskService.updateTask(updatedTicket.taskId, payload)
      .pipe(finalize(() => this.loader.hide()))
      .subscribe({
        next: (res) => {
          if (!res.success) {
            this.toast.error('Failed to update ticket.');
            return;
          }

          this.allTasks.update((list) =>
            list.map((task) => (task.taskId === updatedTicket.taskId ? updatedTicket : task))
          );
          this.selectedTicket = updatedTicket;
          this.toast.success('Ticket updated successfully.');
        },
        error: (err) => {
          console.error('Failed to update ticket', err);
          this.selectedTicket = { ...previousTicket, assignee: { ...previousTicket.assignee }, reporter: { ...previousTicket.reporter } };
          this.toast.error(err?.error?.message ?? 'Failed to update ticket.');
        },
      });
  }

  closeModal(): void {
    this.showTicketModal = false;
    this.selectedTicket = null;
    if (this.location.path().includes('/task-management/')) {
      this.location.go('/dashboard/task-management');
    }
  }

  private openTaskFromUrl(taskId: string, projects = this.allProjects): void {
    const projectTasks = projects.flatMap(project => project.tasks);
    const task = this.allTasks().find(t => t.taskId === taskId) ?? projectTasks.find(t => t.taskId === taskId);

    if (!task) {
      console.warn(`Deep-linked task ${taskId} not found after projects loaded.`);
      this.deepLink.pendingTaskId.set(null);
      return;
    }

    if (!this.allTasks().some(t => t.taskId === task.taskId)) {
      this.allTasks.set(projectTasks);
    }

    this.viewTicket(task, false);
    this.deepLink.pendingTaskId.set(null);
  }

  closeCreateModal(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay'))
      this.showCreateModal = false;
  }

  closeEditModal(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showEditModal = false;
      this.editTask = null;
    }
  }



  exportCSV(): void {
    const headers = ['Task ID', 'Title', 'Status', 'Priority', 'Type', 'Assigned To', 'Project', 'Created At'];
    const rows = this.filteredTasks.map((t) => [
      t.taskId,
      `"${t.title.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.type,
      t.assignee.name,
      this.projectName(t.projectId),
      t.createdAt,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private resetForm(): CreateTaskRequest {
    return {
      title: '',
      description: '',
      priority: 'MEDIUM',
      type: 'TASK',
      assignToId: '',
      projectId: '',
    };
  }
}
