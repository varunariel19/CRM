import { Injectable, signal, computed, inject } from '@angular/core';
import { CommentService } from '../services/comment.service';
import { UserDetails } from '../core/types/global.type';

type CommentStatus = 'idle' | 'loading' | 'error';

export interface CreateCommentPayload {
    content: string;
    ticketId: string;
    activityLogId?: string;
}

export interface EditCommentPayload {
    content: string;
}

export interface TicketComment {
    id: string;
    content: string;
    edited: boolean;
    ticketId: string;
    activityLogId?: string;
    createdAt: string;
    updatedAt: string;
    author?: UserDetails;
}


@Injectable({ providedIn: 'root' })
export class CommentState {
    private readonly commentService = inject(CommentService);

    private _comments = signal<TicketComment[]>([]);
    private _status = signal<CommentStatus>('idle');
    private _error = signal<string | null>(null);
    private _activeTicketId = signal<string | null>(null);
    private _submittingIds = signal<Set<string>>(new Set());

    comments = computed(() => this._comments());
    status = computed(() => this._status());
    error = computed(() => this._error());
    activeTicketId = computed(() => this._activeTicketId());
    isLoading = computed(() => this._status() === 'loading');
    hasError = computed(() => this._status() === 'error');
    totalComments = computed(() => this._comments().length);

    sortedComments = computed(() =>
        [...this._comments()].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    );

    isCommentSubmitting = (commentId: string) =>
        computed(() => this._submittingIds().has(commentId));


    async loadCommentsByTicketId(ticketId: string): Promise<void> {
        this._comments.set([]);
        this._setStatus('loading');

        return new Promise(resolve => {
            this.commentService.getCommentsByTicketId(ticketId).subscribe({
                next: (comments) => {
                    if (this._activeTicketId() !== ticketId) {
                        resolve();
                        return;
                    }

                    this._comments.set(comments);
                    this._setStatus('idle');
                    resolve();
                },
                error: (err) => {
                    if (this._activeTicketId() === ticketId) {
                        this._setError(err?.error?.message ?? 'Failed to load comments.');
                    }
                    resolve();
                },
            });
        });
    }

    async addComment(payload: CreateCommentPayload): Promise<TicketComment | null> {
        this._setStatus('loading');

        return new Promise(resolve => {
            this.commentService.addComment(payload).subscribe({
                next: (comment) => {
                    this._comments.update(prev => [comment, ...prev]);
                    this._setStatus('idle');
                    resolve(comment);
                },
                error: (err) => {
                    this._setError(err?.error?.message ?? 'Failed to add comment.');
                    resolve(null);
                },
            });
        });
    }

    async editComment(commentId: string, payload: EditCommentPayload): Promise<TicketComment | null> {
        this._markSubmitting(commentId, true);

        return new Promise(resolve => {
            this.commentService.editComment(commentId, payload).subscribe({
                next: (updated) => {
                    this._comments.update(prev =>
                        prev.map(c => (c.id === commentId ? updated : c))
                    );
                    this._markSubmitting(commentId, false);
                    resolve(updated);
                },
                error: (err) => {
                    this._setError(err?.error?.message ?? 'Failed to edit comment.');
                    this._markSubmitting(commentId, false);
                    resolve(null);
                },
            });
        });
    }

    setActiveTicket(ticketId: string): void {
        this._activeTicketId.set(ticketId);
    }

    setComments(comments: TicketComment[]): void {
        this._comments.set(comments);
    }

    clear(): void {
        this._comments.set([]);
        this._status.set('idle');
        this._error.set(null);
        this._activeTicketId.set(null);
        this._submittingIds.set(new Set());
    }

    private _setStatus(status: CommentStatus): void {
        this._status.set(status);
        if (status !== 'error') this._error.set(null);
    }

    private _setError(message: string): void {
        this._error.set(message);
        this._status.set('error');
    }

    private _markSubmitting(commentId: string, isSubmitting: boolean): void {
        this._submittingIds.update(prev => {
            const next = new Set(prev);
            isSubmitting ? next.add(commentId) : next.delete(commentId);
            return next;
        });
    }
}

