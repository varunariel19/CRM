import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EditorModule } from 'primeng/editor';
import { Task, TaskPriority, TaskStatus, TaskType } from '../../services/task-management.service';
import { ProjectMember } from '../../features/dashboard/projects/projects.component';
import { CommentState, TicketComment } from '../../state/comment.state';
import { AuthState } from '../../state/auth.state';
import { AiService } from '../../core/services/ai-modal.service';


export interface TicketHistory {
  id: string;
  ticketId: string;
  ticket: Task | null;

  title: string;
  content: string | null;

  commitedBy: UserSummary;

  createdAt: Date;
}

export interface UserSummary {
  id: string;
  name: string;
  profileImage: string;
}


@Component({
  selector: 'app-view-ticket',
  imports: [CommonModule, FormsModule, EditorModule],
  templateUrl: './view-ticket.component.html',
  styleUrls: ['./view-ticket.component.scss']
})


export class ViewTicketComponent implements OnInit, OnChanges, OnDestroy {

  @Input() isOpen = false;
  @Input({ required: true }) ticket!: Task;
  @Input({ required: true }) projectMembers!: ProjectMember[];
  @Output() closeModal = new EventEmitter<void>();
  @Output() ticketUpdated = new EventEmitter<Task>();

  readonly priorities: TaskPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  readonly types: TaskType[] = ['FEATURE', 'BUG', 'TASK', 'CHORE'];
  readonly statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  activeTab: 'all' | 'comments' | 'history' = 'all';
  isEditingDescription = false;
  isGeneratingSummary = false;
  isAiGlowing = false;
  summaryError = '';
  summaryPoints: string[] = [];
  isGeneratingDescription = false;
  isDescriptionGlowing = false;
  descriptionError = '';


  newComment = '';
  htmlContent = '';
  editingCommentId: string | null = null;
  editingCommentText = '';

  private readonly commentState = inject(CommentState);
  private authState = inject(AuthState);
  private readonly aiService = inject(AiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private activeTicketId: string | null = null;

  comments = this.commentState.sortedComments;
  isLoading = this.commentState.isLoading;
  commentError = this.commentState.error;
  isSubmitting = (id: string) => this.commentState.isCommentSubmitting(id);


  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.loadTicketContext();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticket'] && this.ticket) {
      this.loadTicketContext();
    }
  }

  ngOnDestroy(): void {
    this.commentState.clear();
  }


  get currentUserId() {
    return this.authState.userId();
  }

  get safeDescription(): SafeHtml {

    return this.sanitizer.bypassSecurityTrustHtml(this.ticket?.description ?? "");
  }


  startEditing() {
    this.htmlContent = this.ticket?.description ?? "";
    this.descriptionError = '';
    this.isEditingDescription = true;
  }

  saveDescription() {
    const updatedTicket = {
      ...this.ticket,
      description: this.htmlContent,
    };

    this.ticket = updatedTicket;
    this.descriptionError = '';
    this.isEditingDescription = false;
    this.ticketUpdated.emit(updatedTicket);
  }

  cancelEditing() {
    this.descriptionError = '';
    this.isEditingDescription = false;
  }

  async generateDescription(): Promise<void> {
    if (this.isGeneratingDescription) return;

    const referenceDescription = this.stripHtml(this.htmlContent).trim();
    if (!referenceDescription) {
      this.descriptionError = 'Add a short draft description first so AI has a reference.';
      this.cdr.detectChanges();
      return;
    }

    this.isGeneratingDescription = true;
    this.isDescriptionGlowing = true;
    this.descriptionError = '';
    this.cdr.detectChanges();

    try {
      const response = await this.aiService.AiGeneratedResponse(
        'TICKET_DESCRIPTION',
        this.buildDescriptionPayload(referenceDescription),
      );

      if (this.isAiErrorResponse(response)) {
        this.descriptionError = response;
        this.cdr.detectChanges();
        return;
      }

      await this.typeDescriptionEffect(response.trim(), 4);
    } catch {
      this.descriptionError = 'Service is currently unavailable. Please try again later.';
      this.cdr.detectChanges();
    } finally {
      this.isGeneratingDescription = false;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.isDescriptionGlowing = false;
        this.cdr.detectChanges();
      }, 1800);
    }
  }


  async generateSummary(): Promise<void> {
    if (this.isGeneratingSummary) return;

    this.isGeneratingSummary = true;
    this.isAiGlowing = true;
    this.summaryError = '';

    try {
      const response = await this.aiService.AiGeneratedResponse(
        'CHAT_SUMMARY',
        this.buildSummaryPayload(),
      );
      if (this.isAiErrorResponse(response)) {
        this.summaryError = response;
        this.cdr.detectChanges();
        return;
      }

      const points = this.parseSummaryToPoints(response);

      if (!points.length) {
        this.summaryError = 'No summary could be generated for this ticket.';
        this.cdr.detectChanges();
        return;
      }

      await this.typePointsEffect(points, 10);
      this.ticket.aiSummary = [...points];
      this.cdr.detectChanges();
    } catch {
      this.summaryError = 'Service is currently unavailable. Please try again later.';
      this.cdr.detectChanges();
    } finally {
      this.isGeneratingSummary = false;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.isAiGlowing = false;
        this.cdr.detectChanges();
      }, 3000);
    }
  }


  async submitComment(): Promise<void> {
    const msg = this.newComment.trim();
    if (!msg) return;
    const result = await this.commentState.addComment({
      content: msg,
      ticketId: this.ticket.taskId,
    });
    if (result) this.newComment = '';
  }

  startEditingComment(comment: TicketComment): void {
    this.editingCommentId = comment.id;
    this.editingCommentText = comment.content;
  }

  onCommentKeydown(event: KeyboardEvent, commentId: string): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.saveCommentEdit(commentId);
    }
    if (event.key === 'Escape') {
      this.cancelCommentEdit();
    }
  }

  async saveCommentEdit(commentId: string): Promise<void> {
    const msg = this.editingCommentText.trim();
    if (!msg) return;
    const result = await this.commentState.editComment(commentId, { content: msg });
    if (result) this.cancelCommentEdit();
  }

  cancelCommentEdit(): void {
    this.editingCommentId = null;
    this.editingCommentText = '';
  }

  insertQuickReply(text: string) {
    this.newComment = text;
  }


  close() {
    this.resetCommentDraft();
    this.closeModal.emit();
  }

  onAssigneeChange(assigneeId: string): void {
    const member = this.projectMembers.find((m) => m.id === assigneeId);

    this.emitTicketUpdate({
      ...this.ticket,
      assignee: {
        ...this.ticket.assignee,
        id: assigneeId,
        name: member?.name ?? this.ticket.assignee?.name ?? '',
      },
    });
  }

  onStatusChange(status: TaskStatus): void {
    this.emitTicketUpdate({ ...this.ticket, status });
  }

  onPriorityChange(priority: TaskPriority): void {
    this.emitTicketUpdate({ ...this.ticket, priority });
  }

  onTypeChange(type: TaskType): void {
    this.emitTicketUpdate({ ...this.ticket, type });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }


  private loadTicketContext(): void {
    this.setSummaryFromTicket();

    if (!this.ticket?.taskId || this.activeTicketId === this.ticket.taskId) return;

    this.resetCommentDraft();
    this.commentState.clear();
    this.activeTicketId = this.ticket.taskId;
    this.commentState.setActiveTicket(this.ticket.taskId);
    this.commentState.loadCommentsByTicketId(this.ticket.taskId);
  }

  private emitTicketUpdate(updatedTicket: Task): void {
    this.ticket = updatedTicket;
    this.ticketUpdated.emit(updatedTicket);
  }

  private resetCommentDraft(): void {
    this.newComment = '';
    this.cancelCommentEdit();
  }

  private setSummaryFromTicket(): void {
    if (this.isGeneratingSummary) return;

    this.summaryPoints = [...(this.ticket?.aiSummary ?? [])];
    this.summaryError = '';
    this.cdr.detectChanges();
  }


  private buildDescriptionPayload(referenceDescription: string): string {
    return `
Title: ${this.ticket?.title ?? ''}
Current Description Draft: ${referenceDescription}
Status: ${this.ticket?.status ?? ''}
Priority: ${this.ticket?.priority ?? ''}
Type: ${this.ticket?.type ?? ''}
Assignee: ${this.ticket?.assignee?.name ?? ''}
Reporter: ${this.ticket?.reporter?.name ?? ''}

Rewrite the current description into a polished, clear, actionable ticket description.
Keep the same intent and do not add unsupported facts.
    `.trim();
  }

  private stripHtml(value: string): string {
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private typeDescriptionEffect(text: string, speed = 4): Promise<void> {
    return new Promise((resolve) => {
      if (!text) {
        resolve();
        return;
      }

      let index = 0;
      this.htmlContent = '';
      this.cdr.detectChanges();

      const interval = setInterval(() => {
        index++;
        this.htmlContent = text.slice(0, index);
        this.cdr.detectChanges();

        if (index >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }

  private buildSummaryPayload(): string {
    const comments = this.comments()
      .map((comment) => {
        const author = comment.author?.name ?? 'Unknown';
        const createdAt = comment.createdAt
          ? new Date(comment.createdAt).toLocaleString()
          : 'Unknown time';
        return `${author} (${createdAt}): ${comment.content}`;
      })
      .join('\n');

    return `
Title: ${this.ticket?.title ?? ''}
Description: ${this.ticket?.description ?? ''}
Status: ${this.ticket?.status ?? ''}
Priority: ${this.ticket?.priority ?? ''}
Type: ${this.ticket?.type ?? ''}
Assignee: ${this.ticket?.assignee?.name ?? ''}
Reporter: ${this.ticket?.reporter?.name ?? ''}

Comments:
${comments || 'No comments available.'}
    `.trim();
  }


  private isAiErrorResponse(response: string): boolean {
    const normalized = response.trim().toLowerCase();
    return normalized.startsWith('service is currently unavailable')
      || normalized.startsWith('something went wrong');
  }

  private parseSummaryToPoints(text: string): string[] {
    if (!text) return [];

    return text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) =>
        line
          .replace(/^[-*•]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim(),
      )
      .filter(Boolean);
  }

  private async typePointsEffect(points: string[], speed = 12): Promise<void> {
    this.summaryPoints = [];
    this.cdr.detectChanges();

    for (const point of points) {
      this.summaryPoints = [...this.summaryPoints, ''];
      this.cdr.detectChanges();
      await this.typeSingleLine(point, speed);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  private typeSingleLine(text: string, speed = 12): Promise<void> {
    return new Promise((resolve) => {
      let index = 0;

      const interval = setInterval(() => {
        const next = [...this.summaryPoints];
        const lastIndex = next.length - 1;

        next[lastIndex] = (next[lastIndex] || '') + text.charAt(index);
        this.summaryPoints = next;
        this.cdr.detectChanges();
        index++;

        if (index >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }


  // Dummy history data (replace with API call by taskId)
  ticketHistory: TicketHistory[] = [
    {
      id: crypto.randomUUID(),
      ticketId:  "",
      ticket: null!,
      title: 'Status changed',
      content: `<span class="from-pill old">TODO</span><span class="arrow">→</span><span class="from-pill new status">IN_PROGRESS</span>`,
      commitedBy: { id: 'u1', name: 'Sarah Chen', profileImage: 'https://i.pravatar.cc/100?img=12' },
      createdAt: new Date('2026-06-24T10:42:00Z')
    },
    {
      id: crypto.randomUUID(),
      ticketId:  "",

      ticket: null!,
      title: 'Assignee changed',
      content: `<span class="from-pill old">Alex Rivera</span><span class="arrow">→</span><span class="from-pill new assignee">James Okafor</span>`,
      commitedBy: { id: 'u1', name: 'Sarah Chen', profileImage: 'https://i.pravatar.cc/100?img=12' },
      createdAt: new Date('2026-06-23T16:10:00Z')
    },
    {
      id: crypto.randomUUID(),
      ticketId:  "",

      ticket: null!,
      title: 'Priority changed',
      content: `<span class="from-pill old">MEDIUM</span><span class="arrow">→</span><span class="from-pill new priority">HIGH</span>`,
      commitedBy: { id: 'u2', name: 'Priya Nair', profileImage: 'https://i.pravatar.cc/100?img=22' },
      createdAt: new Date('2026-06-23T14:30:00Z')
    },
    {
      id: crypto.randomUUID(),
      ticketId:  "",

      ticket: null!,
      title: 'Description updated',
      content: `<span class="history-text-change">Added OAuth2 token refresh details → Expanded with secure storage requirements</span>`,
      commitedBy: { id: 'u3', name: 'Alex Rivera', profileImage: 'https://i.pravatar.cc/100?img=33' },
      createdAt: new Date('2026-06-22T11:15:00Z')
    },
    {
      id: crypto.randomUUID(),
      ticketId:  "",

      ticket: null!,
      title: 'Bulk update',
      content: `<ul class="history-change-list">
      <li><span class="from-pill old">MEDIUM</span><span class="arrow">→</span><span class="from-pill new priority">HIGH</span></li>
      <li><span class="from-pill old">TODO</span><span class="arrow">→</span><span class="from-pill new status">IN_PROGRESS</span></li>
    </ul>`,
      commitedBy: { id: 'u1', name: 'Sarah Chen', profileImage: 'https://i.pravatar.cc/100?img=12' },
      createdAt: new Date('2026-06-21T09:00:00Z')
    }
  ];

  getHistoryDotClass(title: string): string {
    const t = title.toLowerCase();
    if (t.includes('status')) return 'dot-status';
    if (t.includes('priority')) return 'dot-priority';
    if (t.includes('assignee')) return 'dot-assign';
    if (t.includes('type')) return 'dot-type';
    if (t.includes('description') || t.includes('title')) return 'dot-desc';
    if (t.includes('bulk')) return 'dot-default';
    return 'dot-default';
  }

  getSafeHistoryContent(content: string | null): SafeHtml {
    return content ? this.sanitizer.bypassSecurityTrustHtml(content) : '';
  }

  get mergedFeed(): { type: 'comment' | 'history'; data: any; date: Date }[] {
    const commentEntries = this.comments().map(c => ({
      type: 'comment' as const,
      data: c,
      date: new Date(c.updatedAt)
    }));

    const historyEntries = this.ticketHistory.map(h => ({
      type: 'history' as const,
      data: h,
      date: new Date(h.createdAt)
    }));

    return [...commentEntries, ...historyEntries]
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // newest first
  }

}
