import { Injectable, signal, computed } from '@angular/core';
import { CrmTaskDto } from '../services/crm-task.service';


@Injectable({ providedIn: 'root' })
export class TaskState {

    private _tasks = signal<CrmTaskDto[]>([]);
    private _selectedTask = signal<CrmTaskDto | null>(null);

    tasks = computed(() => this._tasks());
    selectedTask = computed(() => this._selectedTask());

    totalTasks = computed(() => this._tasks().length);


    setTasks(tasks: CrmTaskDto[]): void {
        this._tasks.set(tasks);
    }

    addTask(task: CrmTaskDto): void {
        this._tasks.update(tasks => [task, ...tasks]);
    }

    removeTask(id: string): void {
        this._tasks.update(tasks => tasks.filter(d => d.id !== id));
        if (this._selectedTask()?.id === id) {
            this._selectedTask.set(null);
        }
    }


    updateTask(id: string, updated: Partial<CrmTaskDto>): void {
        this._tasks.update(tasks =>
            tasks.map(task =>
                task.id === id
                    ? { ...task, ...updated }
                    : task
            )
        );
    }


    clear(): void {
        this._tasks.set([]);
        this._selectedTask.set(null);
    }
}