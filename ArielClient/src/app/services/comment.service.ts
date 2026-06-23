import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../core/constants/endpoints';
import { CreateCommentPayload, EditCommentPayload, TicketComment } from '../state/comment.state';


@Injectable({ providedIn: 'root' })
export class CommentService {
    private readonly http = inject(HttpClient);
    private readonly base = endpoints.comments;


    getCommentsByTicketId(ticketId: string): Observable<TicketComment[]> {
        return this.http.get<TicketComment[]>(`${this.base}/ticket/${ticketId}` , {withCredentials : true});
    }


    addComment(payload: CreateCommentPayload): Observable<TicketComment> {
        return this.http.post<TicketComment>(this.base, payload , {withCredentials : true});
    }

    editComment(commentId: string, payload: EditCommentPayload): Observable<TicketComment> {
        return this.http.put<TicketComment>(`${this.base}/${commentId}`, payload , {withCredentials : true});
    }
}