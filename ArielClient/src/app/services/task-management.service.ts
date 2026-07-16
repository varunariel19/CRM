import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { endpoints } from '../core/constants/endpoints';
import { Observable } from 'rxjs';
import { UserSummary } from '../core/types/auth.type';


export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskType = 'FEATURE' | 'BUG' | 'TASK' | 'CHORE';

export interface Task {
    taskId: string;
    ticketId?: number;
    title: string;
    description: string;
    aiSummary?: string[];
    priority: TaskPriority;
    type: TaskType;
    status: TaskStatus;
    assignee: {
        id: string;
        name: string;
        profileImage?: string;
    },
    reporter: {
        id: string;
        name: string;
        profileImage?: string;
    },
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskRequest {
    ticketId?: number;
    title: string;
    description: string;
    priority: TaskPriority;
    type: TaskType;
    assignToId?: string;
    projectId: string;
}

export interface UpdateTaskRequest {
    title: string;
    description: string;
    priority: TaskPriority;
    type: TaskType;
    status: TaskStatus;
    aiSummary?: string[];
    assignToId: string;
}

export interface CreateTaskResponse {
    success: boolean;
    task: Task;
}

export interface ApiResponse {
    success: boolean;
}


export interface TicketHistory {
    id: string;
    ticketId: string;
    title: string;
    content: string | null;
    commitedBy: UserSummary;
    createdAt: string;
}


@Injectable({
    providedIn: 'root',
})

export class TaskManageService {


    private readonly baseUrl = endpoints.taskM;
    constructor(private http: HttpClient) { }


    getAllTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(this.baseUrl, { withCredentials: true });
    }


    getTaskById(taskId: string): Observable<Task> {
        return this.http.get<Task>(`${this.baseUrl}/${taskId}`, { withCredentials: true });
    }

    getChanges(since: Date): Observable<Task[]> {
        const params = new HttpParams().set('since', since.toISOString());
        return this.http.get<Task[]>(`${endpoints.projects}/changes`, { params, withCredentials: true });
    }

    createTask(
        payload: CreateTaskRequest
    ): Observable<CreateTaskResponse> {
        return this.http.post<CreateTaskResponse>(
            this.baseUrl,
            payload,
            { withCredentials: true }
        );
    }

    getTicketHistory(taskId: string): Observable<TicketHistory[]> {
    return this.http.get<TicketHistory[]>(`${endpoints.ticketHistory}/${taskId}`, { withCredentials: true });
}
    
    updateTask(
        taskId: string,
        payload: UpdateTaskRequest
    ): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(
            `${this.baseUrl}/${taskId}`,
            payload,
            { withCredentials: true }
        );
    }


    deleteTask(taskId: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(
            `${this.baseUrl}/${taskId}`,
            { withCredentials: true }
        );
    }
}
