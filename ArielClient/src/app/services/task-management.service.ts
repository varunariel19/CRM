import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../core/constants/endpoints';

const apiEndPoints = {
    tokenValidation: `${BASE_URL}/validate-token`,
    updateticket: `${BASE_URL}/update-ticket`,
    editComment: `${BASE_URL}/edit-comment`,
    uploadTicket: `${BASE_URL}/upload-task`,
    allTasks: `${BASE_URL}/fetch-all-task`,
    addComment: `${BASE_URL}/add-comment`,
    allComments: `${BASE_URL}/comments`,
    allUsers: `${BASE_URL}/all-users`,
    register: `${BASE_URL}/register`,
    login: `${BASE_URL}/login`,
    AIUrl: 'https://api.groq.com/openai/v1/chat/completions',
    groqApiKey: ``,
    geminiApiKey: '',
};


@Injectable({
    providedIn: 'root',
})

export class TaskManageService {

    constructor(private http: HttpClient) { }

    addTask(task: any) {
        return this.http.post(apiEndPoints.uploadTicket, task);
    }

    getAllTickets() {
        return this.http.get(apiEndPoints.allTasks);
    }

    updateTicket(ticketId: string, updates: any) {
        return this.http.post(apiEndPoints.updateticket, { taskId: ticketId, updates })
    }


    handleAddComment(comment: any) {
        return this.http.post(`${apiEndPoints.addComment}/${comment.taskId}`, { comment });
    }

    handleGetAllComments(taskId: string) {
        return this.http.get(`${apiEndPoints.allComments}/${taskId}`);
    }

    handleUpdateComment(updates: any) {
        return this.http.post(apiEndPoints.editComment, updates);
    }

}
