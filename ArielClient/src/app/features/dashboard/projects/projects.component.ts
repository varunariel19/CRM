import { Component, signal, computed, effect, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProjectService } from '../../../services/project.service';
import { ProjectState } from '../../../state/project.state';
import { TeamState } from '../../../state/team.state';
import { PermissionFacade } from '../../../core/services/permissionFacade.service';
import { Task } from '../../../services/task-management.service';
import { GlobalState } from '../../../state/global.state';
import { ProjectMemberDepartment } from '../../../core/constants/global';
import { AuthState } from '../../../state/auth.state';
import { DeepLinkService } from '../../../core/services/deepLink.service';
import { UserProfileComponent } from '../../../components/items/user-profile/user-profile.component';

export interface ProjectMember {
  id: string;
  name: string;
  profileImage?: string;
}

export interface ProjectDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadId: string;
  uploadedAt: string;
}

export interface ClientInfo {
  name: string;
  email: string;
  companyName: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  dealId?: string;
  projectKey: string;
  createdAt: string;
  client?: ClientInfo;
  projectLead?: ProjectMember;
  members: ProjectMember[];
  tasks: Task[],
  documents: ProjectDocument[];
  tasksTotal: number;
  tasksCompleted: number;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, UserProfileComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  private readonly projectService = inject(ProjectService);
  private readonly projectState = inject(ProjectState);
  private readonly teamState = inject(TeamState);
  private readonly authState = inject(AuthState);
  private readonly globalState = inject(GlobalState);
  private readonly deepLink = inject(DeepLinkService);
  private readonly location = inject(Location);
  perm = inject(PermissionFacade);

  searchQuery = signal('');
  filterStatus = signal('all');
  selectedProject = signal<Project | null>(null);
  activeTab = signal<'overview' | 'members' | 'documents'>('overview');
  isModalOpen = signal(false);
  isCreateModalOpen = signal(false);

  isMemberPickerOpen = signal(false);
  memberPickerSearch = signal('');
  pendingMembers = signal<ProjectMember[]>([]);
  isAddingMembers = signal(false);


  projects = this.projectState.projects;
  loading = this.projectState.loading;

  newProject = signal({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    projectLeadId: this.authState.userId(),
    dealId: '',
  });
  selectedFiles = signal<File[]>([]);
  isCreating = signal(false);
  availableUsers = signal<{ id: string; name: string }[]>([]);
  availableDeals = signal<{ id: string; name: string }[]>([]);

  constructor() {
    effect(() => {
      const projectId = this.deepLink.pendingProjectId();
      if (projectId) {
        this.openProjectFromUrl(projectId);
      }
    });
  }

  ngOnInit(): void {
  }

  private loadProjects(): void {
    this.projectState.setLoading(true);
    this.projectService.fetchAllProjects().subscribe({
      next: (res: any) => {
        this.projectState.setProjects(res.data ?? res);
        this.projectState.setLoading(false);
      },
      error: () => this.projectState.setLoading(false)
    });
  }

  get departments() {
    return this.globalState.departments();
  }

  department(key: string) {
    return this.departments.find(each => each.departmentKey == key);
  }

  get teamMembers() {
    const departmentIds = ProjectMemberDepartment
      .map(key => this.department(key)?.id)
      .filter((id): id is string => !!id);

    return this.teamState.teamMembers().filter(each =>
      departmentIds.includes(each.departmentId)
    );
  }



  availableToAdd = computed(() => {
    const proj = this.selectedProject();
    const existingIds = new Set((proj?.members ?? []).map(m => m.id));
    const pendingIds = new Set(this.pendingMembers().map(m => m.id));
    const q = this.memberPickerSearch().toLowerCase().trim();

    return this.teamMembers
      .filter(m => !existingIds.has(m.id) && !pendingIds.has(m.id))
      .filter(m => !q || m.name.toLowerCase().includes(q));
  });

  filteredProjects = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const s = this.filterStatus();
    return this.projects().filter(proj => {
      const matchSearch =
        proj.name.toLowerCase().includes(q) ||
        proj.projectKey.toLowerCase().includes(q);
      const matchStatus =
        s === 'all' ||
        (s === 'active' && proj.isActive) ||
        (s === 'inactive' && !proj.isActive);
      return matchSearch && matchStatus;
    });
  });

  statusCounts = computed(() => {
    const all = this.projects();
    return {
      total: all.length,
      active: all.filter(p => p.isActive).length,
      inactive: all.filter(p => !p.isActive).length,
    };
  });

  openProject(project: Project, updateUrl = true) {
    this.selectedProject.set(project);
    this.activeTab.set('overview');
    this.isModalOpen.set(true);
    this.isMemberPickerOpen.set(false);
    this.memberPickerSearch.set('');
    this.pendingMembers.set([]);
    document.body.style.overflow = 'hidden';
    if (updateUrl) {
      this.location.go(`/dashboard/projects/${project.id}`);
    }
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedProject.set(null);
    this.isMemberPickerOpen.set(false);
    this.memberPickerSearch.set('');
    this.pendingMembers.set([]);
    document.body.style.overflow = '';
    if (this.location.path().includes('/projects/')) {
      this.location.go('/dashboard/projects');
    }
  }

  private openProjectFromUrl(projectId: string): void {
    const project = this.projects().find(p => p.id === projectId);
    if (!project) return;

    this.openProject(project, false);
    this.deepLink.pendingProjectId.set(null);
  }

  setTab(tab: 'overview' | 'members' | 'documents') {
    this.activeTab.set(tab);
    if (tab !== 'members') {
      this.isMemberPickerOpen.set(false);
      this.memberPickerSearch.set('');
      this.pendingMembers.set([]);
    }
  }

  openMemberPicker() {
    this.pendingMembers.set([]);
    this.memberPickerSearch.set('');
    this.isMemberPickerOpen.set(true);
  }

  closeMemberPicker() {
    this.isMemberPickerOpen.set(false);
    this.memberPickerSearch.set('');
    this.pendingMembers.set([]);
  }

  togglePendingMember(member: ProjectMember) {
    const current = this.pendingMembers();
    const exists = current.some(m => m.id === member.id);
    if (exists) {
      this.pendingMembers.set(current.filter(m => m.id !== member.id));
    } else {
      this.pendingMembers.set([...current, member]);
    }
  }

  isPending(memberId: string): boolean {
    return this.pendingMembers().some(m => m.id === memberId);
  }

  confirmAddMembers() {
    const proj = this.selectedProject();
    const pending = this.pendingMembers();
    if (!proj || pending.length === 0) return;

    const updated: Project = {
      ...proj,
      members: [...proj.members, ...pending]
    };
    this.selectedProject.set(updated);
    this.closeMemberPicker();
    this.isAddingMembers.set(true);

    forkJoin(pending.map(m => this.projectService.addMemberToProject(proj.id, m.id)))
      .subscribe({
        next: () => { this.isAddingMembers.set(false); this.loadProjects(); },
        error: () => { this.selectedProject.set(proj); this.isAddingMembers.set(false); }
      });
  }

  removeMember(memberId: string) {
    const proj = this.selectedProject();
    if (!proj) return;

    const updated: Project = {
      ...proj,
      members: proj.members.filter(m => m.id !== memberId)
    };
    this.selectedProject.set(updated);

    this.projectService.removeMemberFromProject(proj.id, memberId).subscribe({
      next: () => this.loadProjects(),
      error: () => this.selectedProject.set(proj)
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getDocIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      pdf: '📄', doc: '📝', docx: '📝',
      xls: '📊', xlsx: '📊', png: '🖼️',
      jpg: '🖼️', jpeg: '🖼️', zip: '📦'
    };
    return map[ext ?? ''] || '📄';
  }

  getDaysLeft(date: string): number {
    const d = new Date(date);
    const today = new Date();
    return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatDaysLeft(date: string): string {
    const days = this.getDaysLeft(date);
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    return `${days}d left`;
  }

  isOverdue(date: string): boolean {
    return this.getDaysLeft(date) < 0;
  }

  getProgressPercent(project: Project): number {
    if (project.tasksTotal === 0) return 0;
    return Math.round((project.tasksCompleted / project.tasksTotal) * 100);
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  openCreateModal() {
    this.newProject.set({ name: '', description: '', startDate: '', endDate: '', projectLeadId: '', dealId: '' });
    this.selectedFiles.set([]);
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
  }

  updateNewProject(field: string, value: string) {
    this.newProject.update(p => ({ ...p, [field]: value }));
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles.update(prev => [...prev, ...Array.from(input.files!)]);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.selectedFiles.update(prev => [...prev, ...Array.from(event.dataTransfer!.files)]);
    }
  }

  removeFile(index: number) {
    this.selectedFiles.update(prev => prev.filter((_, i) => i !== index));
  }

  submitCreateProject() {
    const p = this.newProject();
    if (!p.name.trim()) return;

    this.isCreating.set(true);
    const formData = new FormData();
    formData.append('name', p.name);
    formData.append('description', p.description);
    formData.append('startDate', p.startDate);
    formData.append('endDate', p.endDate);
    formData.append('projectLeadId', p.projectLeadId!);
    formData.append('dealId', p.dealId);
    this.selectedFiles().forEach(f => formData.append('documents', f));

    this.projectService.createProject(formData).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.closeCreateModal();
        this.loadProjects();
      },
      error: () => this.isCreating.set(false)
    });
  }

  onCreateOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeCreateModal();
    }
  }
}
