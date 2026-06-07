import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { ProjectState } from '../../../state/project.state';


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
  documents: ProjectDocument[];
  tasksTotal: number;
  tasksCompleted: number;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  private readonly projectService = inject(ProjectService);
  private readonly projectState = inject(ProjectState);

  searchQuery = signal('');
  filterStatus = signal('all');
  selectedProject = signal<Project | null>(null);
  activeTab = signal<'overview' | 'members' | 'documents'>('overview');
  isModalOpen = signal(false);
  isCreateModalOpen = signal(false);

  projects = this.projectState.projects;
  loading = this.projectState.loading;

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.projectState.setLoading(true);
    this.projectService.fetchAllProjects().subscribe({
      next: (res: any) => {
        this.projectState.setProjects(res.data ?? res);
        this.projectState.setLoading(false);
      },
      error: () => {
        this.projectState.setLoading(false);
      }
    });
  }

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

  openProject(project: Project) {
    this.selectedProject.set(project);
    this.activeTab.set('overview');
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedProject.set(null);
    document.body.style.overflow = '';
  }


  setTab(tab: 'overview' | 'members' | 'documents') {
    this.activeTab.set(tab);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getDocIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      'pdf': '📄', 'doc': '📝', 'docx': '📝',
      'xls': '📊', 'xlsx': '📊', 'png': '🖼️',
      'jpg': '🖼️', 'jpeg': '🖼️', 'zip': '📦'
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


newProject = signal({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  projectLeadId: '',
  dealId: '',
});
selectedFiles = signal<File[]>([]);
isCreating = signal(false);
availableUsers = signal<{ id: string; name: string }[]>([]);
availableDeals = signal<{ id: string; name: string }[]>([]);

openCreateModal() {
  this.newProject.set({ name: '', description: '', startDate: '', endDate: '', projectLeadId: '', dealId: '' });
  this.selectedFiles.set([]);
  this.isCreateModalOpen.set(true);
}
  closeCreateModal() { this.isCreateModalOpen.set(false); }


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
  formData.append('projectLeadId', p.projectLeadId);
  formData.append('dealId', p.dealId);
  this.selectedFiles().forEach(f => formData.append('documents', f));

  this.projectService.createProject(formData).subscribe({
    next: (res: any) => {
      this.isCreating.set(false);
      this.closeCreateModal();
      this.loadProjects();
    },
    error: () => {
      this.isCreating.set(false);
    }
  });
}

onCreateOverlayClick(event: MouseEvent) {
  if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
    this.closeCreateModal();
  }
}

}