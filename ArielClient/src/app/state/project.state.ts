import { Injectable, signal, computed } from '@angular/core';
import { Project } from '../features/dashboard/projects/projects.component';

@Injectable({ providedIn: 'root' })
export class ProjectState {

    private _projects = signal<Project[]>([]);
    private _selectedProject = signal<Project | null>(null);
    private _loading = signal(false);

    projects = computed(() => this._projects());
    selectedProject = computed(() => this._selectedProject());
    loading = computed(() => this._loading());

    projectCount = computed(() => this._projects().length);

    setProjects(projects: Project[]): void {
        this._projects.set(projects);
    }

    addProject(project: Project): void {
        this._projects.update(prev => [project, ...prev]);
    }

    updateProject(updated: Project): void {
        this._projects.update(prev =>
            prev.map(p => p.id === updated.id ? updated : p)
        );
    }

    removeProject(projectId: string): void {
        this._projects.update(prev =>
            prev.filter(p => p.id !== projectId)
        );
    }

    setSelectedProject(project: Project | null): void {
        this._selectedProject.set(project);
    }

    setLoading(value: boolean): void {
        this._loading.set(value);
    }

    clear(): void {
        this._projects.set([]);
        this._selectedProject.set(null);
        this._loading.set(false);
    }
}