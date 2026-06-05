import { Component, inject, signal, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateTaskPayload, MEMBERS, Project, PROJECTS, SEED_TASKS, Task, TaskColumn, TaskManagementState, TaskMember, TaskPriority, TaskStatus, TaskType } from '../../../state/task-management.state';
import { ViewTicketComponent } from '../../../components/view-ticket/view-ticket.component';


@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewTicketComponent],
  templateUrl: './task-management.component.html',
  styleUrl: './task-management.component.css',
})


export class TaskManagementComponent {

  taskState = inject(TaskManagementState);

  readonly currentUserId = 'm1';

  allTasks = signal<Task[]>(
    SEED_TASKS.map((t) => ({ ...t, assignee: MEMBERS.find((m) => m.id === t.assigneeId) })),
  );

  
  allProjects = signal<Project[]>(PROJECTS);
  allMembers = signal<TaskMember[]>(MEMBERS);

  readonly columns: TaskColumn[] = this.taskState.columns();
  readonly priorities: TaskPriority[] = ['Critical', 'High', 'Medium', 'Low'];
  readonly types: TaskType[] = ['Feature', 'Bug', 'Task', 'Chore'];
  readonly statuses: TaskStatus[] = ['todo', 'inprogress', 'review', 'done'];

  selectedProjectId = signal('');
  selectedMemberId = signal('');
  filterByMe = signal(false);
  selectedPriority = signal('');

  showCreateModal = false;
  showEditModal = false;
  newTask: CreateTaskPayload = this.resetForm();
  editTask: any = null;

  draggedTask: Task | null = null;
  draggedFrom = '';

  get projectMembers(): TaskMember[] {
    const pid = this.selectedProjectId();
    if (!pid) return this.allMembers();
    const proj = this.allProjects().find((p) => p.id === pid);
    return proj ? this.allMembers().filter((m) => proj.memberIds.includes(m.id)) : [];
  }

  get filteredTasks(): Task[] {
    let tasks = this.allTasks();
    const pid = this.selectedProjectId();
    if (pid) tasks = tasks.filter((t) => t.projectId === pid);
    if (this.filterByMe()) {
      tasks = tasks.filter((t) => t.assigneeId === this.currentUserId);
    } else {
      const mid = this.selectedMemberId();
      if (mid) tasks = tasks.filter((t) => t.assigneeId === mid);
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

  getColumnTasks(s: TaskStatus) {
    return this.filteredTasks.filter((t) => t.status === s);
  }

  getTotalPoints(tasks: Task[]) {
    return tasks.reduce((s, t) => s + t.storyPoints, 0);
  }

  projectName(id: string) {
    return this.allProjects().find((p) => p.id === id)?.name ?? '—';
  }

  initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  priorityMeta(p: TaskPriority) {
    return {
      Critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '🔴' },
      High: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: '▲' },
      Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '◈' },
      Low: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '▽' },
    }[p];
  }

  typeMeta(t: TaskType) {
    return {
      Feature: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      Bug: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      Task: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
      Chore: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    }[t];
  }

  onProjectChange() {
    this.selectedMemberId.set('');
  }

  clearFilters() {
    this.selectedProjectId.set('');
    this.selectedMemberId.set('');
    this.filterByMe.set(false);
    this.selectedPriority.set('');
  }

  private resetForm(): CreateTaskPayload {
    return {
      title: '',
      description: '',
      status: 'todo',
      priority: 'Medium',
      type: 'Task',
      assigneeId: '',
      projectId: '',
      dueDate: new Date().toISOString().split('T')[0],
      storyPoints: 1,
      tags: '',
    };
  }

  submitTask(): void {
    if (!this.newTask.title.trim() || !this.newTask.assigneeId || !this.newTask.projectId) {
      alert('Title, Project, and Assignee are required.');
      return;
    }
    const assignee = this.allMembers().find((m) => m.id === this.newTask.assigneeId);
    const id = `TSK-${this.allTasks().length + 101}`;
    this.allTasks.update((list) => [
      ...list,
      {
        id,
        title: this.newTask.title,
        description: this.newTask.description,
        status: this.newTask.status,
        priority: this.newTask.priority,
        type: this.newTask.type,
        assigneeId: this.newTask.assigneeId,
        assignee,
        projectId: this.newTask.projectId,
        dueDate: this.newTask.dueDate,
        storyPoints: this.newTask.storyPoints,
        tags: this.newTask.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      },
    ]);
    this.showCreateModal = false;
    this.newTask = this.resetForm();
  }

  openEditModal(task: Task): void {
    this.editTask = { ...task, tags: task.tags.join(', ') };
    this.showEditModal = true;
  }

  submitEdit(): void {
    if (!this.editTask) return;
    const assignee = this.allMembers().find((m) => m.id === this.editTask.assigneeId);
    const tags = (this.editTask.tags as string)
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);
    this.allTasks.update((list) =>
      list.map((t) => (t.id === this.editTask.id ? { ...t, ...this.editTask, assignee, tags } : t)),
    );
    this.showEditModal = false;
    this.editTask = null;
  }

  moveLeft(colKey: string, task: Task): void {
    const idx = this.columns.findIndex((c) => c.key === colKey);
    if (idx > 0) this.setStatus(task, this.columns[idx - 1].key as TaskStatus);
  }

  moveRight(colKey: string, task: Task): void {
    const idx = this.columns.findIndex((c) => c.key === colKey);
    if (idx < this.columns.length - 1)
      this.setStatus(task, this.columns[idx + 1].key as TaskStatus);
  }

  private setStatus(task: Task, status: TaskStatus): void {
    this.allTasks.update((list) => list.map((t) => (t.id === task.id ? { ...t, status } : t)));
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
    this.setStatus(this.draggedTask, targetKey as TaskStatus);
    this.draggedTask = null;
    this.draggedFrom = '';
  }

  closeCreateModal(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.showCreateModal = false;
  }

  closeEditModal(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showEditModal = false;
      this.editTask = null;
    }
  }


  showTicketModal = false;
  viewTicket() {
    this.showTicketModal = true;
  }


  closeModal() {
    this.showTicketModal = false;
  }


  // ── Export
  exportCSV(): void {
    const header = [
      'ID',
      'Title',
      'Status',
      'Priority',
      'Type',
      'Assignee',
      'Project',
      'Due Date',
      'Points',
      'Tags',
    ];
    const rows = this.filteredTasks.map((t) => [
      t.id,
      t.title,
      t.status,
      t.priority,
      t.type,
      t.assignee?.name ?? '',
      this.projectName(t.projectId),
      t.dueDate,
      String(t.storyPoints),
      t.tags.join('; '),
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'tasks-export.csv';
    a.click();
  }
}
