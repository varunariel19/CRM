import { Injectable, computed, signal } from '@angular/core';
import { Task, TaskPriority, TaskStatus } from '../services/task-management.service';


export interface TaskMember {
    id: string;
    name: string;
}

export interface TaskColumn {
    key: TaskStatus;
    title: string;
    color: string;
}

const TASK_COLUMNS: TaskColumn[] = [
    { key: 'TODO', title: 'To Do', color: '#6b7280' },
    { key: 'IN_PROGRESS', title: 'In Progress', color: '#3b82f6' },
    { key: 'REVIEW', title: 'Review', color: '#f59e0b' },
    { key: 'DONE', title: 'Done', color: '#10b981' },
];



@Injectable({
    providedIn: 'root',
})

export class TaskManagementState {

    private _tasks = signal<Task[]>([]);
    private _selectedTask = signal<Task | null>(null);
    private _loading = signal(false);
    private _sinceTime = signal<Date | null>(null);


    readonly sinceTime = computed(() => this._sinceTime());
    readonly tasks = computed(() => this._tasks());
    readonly selectedTask = computed(() => this._selectedTask());
    readonly loading = computed(() => this._loading());

    readonly totalTasks = computed(() => this._tasks().length);

    readonly completedTasks = computed(() =>
        this._tasks().filter(t => t.status === 'DONE').length
    );


    readonly columns = computed(() =>
        TASK_COLUMNS.map(column => ({
            ...column,
            tasks: this._tasks().filter(task => task.status === column.key),
        }))
    );

    readonly tasksByStatus = computed(() => {
        const map = new Map<TaskStatus, Task[]>();

        TASK_COLUMNS.forEach(col => {
            map.set(col.key, []);
        });

        this._tasks().forEach(task => {
            map.get(task.status)?.push(task);
        });

        return map;
    });


    setSinceTime(date: Date) {
        this._sinceTime.set(date);
    }

    getSinceTime() {
        return this.sinceTime();
    }

    setTasks(tasks: Task[]): void {
        this._tasks.set(tasks);
    }

    setLoading(loading: boolean): void {
        this._loading.set(loading);
    }

    selectTask(task: Task | null): void {
        this._selectedTask.set(task);
    }

    addTask(task: Task): void {
        this._tasks.update(tasks => [task, ...tasks]);
    }

    updateTask(id: string, changes: Partial<Task>): void {

    }

    removeTask(id: string): void {

    }


    moveTask(id: string, status: TaskStatus): void {
        this.updateTask(id, { status });
    }



    getTasksByProject(projectId: string): Task[] {
        return this._tasks().filter(
            task => task.projectId === projectId
        );
    }

    getTasksByMember(memberId: string): Task[] {
        return [];
    }

    getTasksByPriority(priority: TaskPriority): Task[] {
        return [];
    }

    getTasksByStatus(status: TaskStatus): Task[] {
        return this._tasks().filter(
            task => task.status === status
        );
    }


    clear(): void {
        this._tasks.set([]);
        this._selectedTask.set(null);
    }
}