import { Injectable, computed, signal } from '@angular/core';

export type TaskStatus = 'todo' | 'inprogress' | 'review' | 'done';
export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TaskType = 'Feature' | 'Bug' | 'Task' | 'Chore';

export interface TaskMember {
    id: string;
    name: string;
}

export interface Project {
    id: string;
    name: string;
    memberIds: string[];
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    type: TaskType;
    assigneeId: string;
    assignee?: TaskMember;
    projectId: string;
    dueDate: string;
    storyPoints: number;
    tags: string[];
}

export interface TaskColumn {
    key: TaskStatus;
    title: string;
    color: string;
}

export interface TaskMember {
    id: string;
    name: string;
}

export interface Project {
    id: string;
    name: string;
    memberIds: string[];
}

export interface CreateTaskPayload {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    type: TaskType;
    assigneeId: string;
    projectId: string;
    dueDate: string;
    storyPoints: number;
    tags: string;
}

export const MEMBERS: TaskMember[] = [
    { id: 'm1', name: 'Arjun Mehta' },
    { id: 'm2', name: 'Priya Sharma' },
    { id: 'm3', name: 'Rohit Das' },
    { id: 'm4', name: 'Sneha Rao' },
    { id: 'm5', name: 'Karan Patel' },
];

export const PROJECTS: Project[] = [
    { id: 'p1', name: 'CRM Platform', memberIds: ['m1', 'm2', 'm3', 'm4', 'm5'] },
    { id: 'p2', name: 'Mobile App', memberIds: ['m1', 'm3', 'm5'] },
    { id: 'p3', name: 'Analytics Suite', memberIds: ['m2', 'm4'] },
];

export const SEED_TASKS: Task[] = [
    {
        id: 'TSK-101',
        title: 'Set up authentication module',
        description: 'Implement JWT-based login and role guards.',
        status: 'todo',
        priority: 'High',
        type: 'Feature',
        assigneeId: 'm1',
        projectId: 'p1',
        dueDate: '2025-07-10',
        storyPoints: 8,
        tags: ['auth', 'backend'],
    },
    {
        id: 'TSK-102',
        title: 'Design lead capture form',
        description: 'Responsive multi-step form for new leads.',
        status: 'todo',
        priority: 'Medium',
        type: 'Feature',
        assigneeId: 'm2',
        projectId: 'p1',
        dueDate: '2025-07-14',
        storyPoints: 5,
        tags: ['ui', 'leads'],
    },
    {
        id: 'TSK-103',
        title: 'Fix pagination bug on customer',
        description: 'Last page shows duplicate records.',
        status: 'todo',
        priority: 'Critical',
        type: 'Bug',
        assigneeId: 'm3',
        projectId: 'p1',
        dueDate: '2025-07-05',
        storyPoints: 3,
        tags: ['bug', 'customers'],
    },
    {
        id: 'TSK-104',
        title: 'Build Kanban deal pipeline',
        description: 'Drag-and-drop board for deal stages.',
        status: 'inprogress',
        priority: 'High',
        type: 'Feature',
        assigneeId: 'm1',
        projectId: 'p2',
        dueDate: '2025-07-20',
        storyPoints: 13,
        tags: ['deals', 'ui'],
    },
    {
        id: 'TSK-105',
        title: 'Integrate email notifications',
        description: 'Automated emails on ticket status change.',
        status: 'inprogress',
        priority: 'Medium',
        type: 'Task',
        assigneeId: 'm4',
        projectId: 'p1',
        dueDate: '2025-07-18',
        storyPoints: 5,
        tags: ['email'],
    },
    {
        id: 'TSK-106',
        title: 'Analytics dashboard charts',
        description: 'Revenue, leads and conversion via Chart.js.',
        status: 'inprogress',
        priority: 'High',
        type: 'Feature',
        assigneeId: 'm2',
        projectId: 'p3',
        dueDate: '2025-07-22',
        storyPoints: 8,
        tags: ['analytics', 'charts'],
    },
    {
        id: 'TSK-107',
        title: 'Mobile push notification setup',
        description: 'Configure FCM for iOS and Android alerts.',
        status: 'inprogress',
        priority: 'Low',
        type: 'Chore',
        assigneeId: 'm5',
        projectId: 'p2',
        dueDate: '2025-07-25',
        storyPoints: 3,
        tags: ['mobile'],
    },
    {
        id: 'TSK-108',
        title: 'Audit history table component',
        description: 'Filterable and sortable audit log.',
        status: 'review',
        priority: 'Low',
        type: 'Chore',
        assigneeId: 'm3',
        projectId: 'p1',
        dueDate: '2025-07-08',
        storyPoints: 3,
        tags: ['audit'],
    },
    {
        id: 'TSK-109',
        title: 'Customer profile edit modal',
        description: 'Inline editing with validation.',
        status: 'review',
        priority: 'Medium',
        type: 'Feature',
        assigneeId: 'm4',
        projectId: 'p1',
        dueDate: '2025-07-12',
        storyPoints: 5,
        tags: ['customers', 'modal'],
    },
    {
        id: 'TSK-110',
        title: 'Dark mode theming pass',
        description: 'Apply dark mode CSS vars across components.',
        status: 'review',
        priority: 'Medium',
        type: 'Task',
        assigneeId: 'm2',
        projectId: 'p3',
        dueDate: '2025-07-09',
        storyPoints: 5,
        tags: ['ui', 'theming'],
    },
    {
        id: 'TSK-111',
        title: 'Set up CI/CD pipeline',
        description: 'GitHub Actions for lint, test and deploy.',
        status: 'done',
        priority: 'High',
        type: 'Task',
        assigneeId: 'm1',
        projectId: 'p2',
        dueDate: '2025-06-28',
        storyPoints: 5,
        tags: ['devops', 'ci'],
    },
    {
        id: 'TSK-112',
        title: 'Database schema finalization',
        description: 'Define all entities and relations.',
        status: 'done',
        priority: 'Critical',
        type: 'Task',
        assigneeId: 'm3',
        projectId: 'p1',
        dueDate: '2025-06-25',
        storyPoints: 8,
        tags: ['db', 'backend'],
    },
];

const TASK_COLUMNS: TaskColumn[] = [
    { key: 'todo', title: 'To Do', color: '#6b7280' },
    { key: 'inprogress', title: 'In Progress', color: '#3b82f6' },
    { key: 'review', title: 'Review', color: '#f59e0b' },
    { key: 'done', title: 'Done', color: '#10b981' },
];




@Injectable({
    providedIn: 'root',
})

export class TaskManagementState {

    private _tasks = signal<Task[]>([]);
    private _selectedTask = signal<Task | null>(null);
    private _loading = signal(false);

    readonly tasks = computed(() => this._tasks());
    readonly selectedTask = computed(() => this._selectedTask());
    readonly loading = computed(() => this._loading());

    readonly totalTasks = computed(() => this._tasks().length);

    readonly completedTasks = computed(() =>
        this._tasks().filter(t => t.status === 'done').length
    );

    readonly totalStoryPoints = computed(() =>
        this._tasks().reduce((sum, task) => sum + task.storyPoints, 0)
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
        this._tasks.update(tasks =>
            tasks.map(task =>
                task.id === id
                    ? { ...task, ...changes }
                    : task
            )
        );

        if (this._selectedTask()?.id === id) {
            this._selectedTask.update(task =>
                task ? { ...task, ...changes } : null
            );
        }
    }

    removeTask(id: string): void {
        this._tasks.update(tasks =>
            tasks.filter(task => task.id !== id)
        );

        if (this._selectedTask()?.id === id) {
            this._selectedTask.set(null);
        }
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
        return this._tasks().filter(
            task => task.assigneeId === memberId
        );
    }

    getTasksByPriority(priority: TaskPriority): Task[] {
        return this._tasks().filter(
            task => task.priority === priority
        );
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