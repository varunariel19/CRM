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
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Editor, EditorModule } from 'primeng/editor';
import { Task, TaskManageService, TaskPriority, TaskStatus, TaskType, TicketHistory } from '../../services/task-management.service';
import { ProjectMember } from '../../features/dashboard/projects/projects.component';
import { CommentState, TicketComment } from '../../state/comment.state';
import { AuthState } from '../../state/auth.state';
import { AiService } from '../../core/services/ai-modal.service';
import { PermissionFacade } from '../../core/services/permissionFacade.service';
import { AppwriteService } from '../../core/services/appwrite.service';
import { UserProfileComponent } from '../items/user-profile/user-profile.component';


@Component({
  selector: 'app-view-ticket',
  imports: [CommonModule, FormsModule, EditorModule, UserProfileComponent],
  templateUrl: './view-ticket.component.html',
  styleUrls: ['./view-ticket.component.scss']
})


export class ViewTicketComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('editor') editor!: Editor;
  @Input() isOpen = false;
  @Input({ required: true }) ticket!: Task;
  @Input({ required: true }) projectMembers!: ProjectMember[];
  @Output() closeModal = new EventEmitter<void>();
  @Output() ticketUpdated = new EventEmitter<Task>();


  perm = inject(PermissionFacade);
  private readonly taskManageService = inject(TaskManageService);

  readonly priorities: TaskPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  readonly types: TaskType[] = ['FEATURE', 'BUG', 'TASK', 'CHORE'];
  readonly statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  activeTab: 'comments' | 'history' = 'comments';
  isEditingDescription = false;
  isGeneratingSummary = false;
  isUploading = false;
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

  ticketHistory: TicketHistory[] = [];
  isLoadingHistory = false;
  historyError = '';

  private readonly commentState = inject(CommentState);
  private authState = inject(AuthState);
  private readonly aiService = inject(AiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private activeTicketId: string | null = null;

  comments = this.commentState.sortedComments;
  isLoading = this.commentState.isLoading;
  commentError = this.commentState.error;
  assigneeDropdownOpen = false;

  quillInstance: any;

  constructor(private sanitizer: DomSanitizer, private appwrite: AppwriteService) { }


  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('.custom-select')) {
      this.assigneeDropdownOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }

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

  isSubmitting = (id: string) => this.commentState.isCommentSubmitting(id);


  onEditorInit(event: any): void {
    this.quillInstance = event.editor;

    const toolbar = this.quillInstance.getModule('toolbar');
    toolbar.addHandler('image', () => this.handleImageInsert());
  }

  handleImageInsert(): void {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      this.isUploading = true;
      document.body.style.cursor = 'wait';
      try {
        const url = await this.appwrite.uploadFile(file);

        const range = this.quillInstance.getSelection(true);
        this.quillInstance.insertEmbed(range.index, 'image', url);
        this.quillInstance.setSelection(range.index + 1);

        this.htmlContent = this.quillInstance.root.innerHTML;
        this.cdr.detectChanges();

        console.log("description", this.htmlContent);
      } catch {
        // consider setting an error/toast here, this is currently a silent failure
      } finally {
        this.isUploading = false;
        document.body.style.cursor = 'default';
      }
    };
  }

  selectedAssignee() {
    return this.projectMembers.find(m => m.id === this.ticket.assignee.id) ?? null;
  }

  toggleAssigneeDropdown() {
    this.assigneeDropdownOpen = !this.assigneeDropdownOpen;
  }

  selectAssignee(member: ProjectMember) {
    this.assigneeDropdownOpen = false;
    this.onAssigneeChange(member.id);
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

  initials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
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
        id: assigneeId,
        profileImage: member?.profileImage ?? "",
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
    if (!content) return '';

    const transformed = this.stripMediaTagsToUrls(content);
    return this.sanitizer.bypassSecurityTrustHtml(transformed);
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

  canEditAsAssignee(): boolean {
    return this.ticket?.assignee?.id === this.authState.userId();
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
      const updatedTicket = {
        ...this.ticket,
        aiSummary: [...points],
      };
      console.log("updated ticket data ", updatedTicket);
      this.ticketUpdated.emit(updatedTicket);
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



  async saveCommentEdit(commentId: string): Promise<void> {
    const msg = this.editingCommentText.trim();
    if (!msg) return;
    const result = await this.commentState.editComment(commentId, { content: msg });
    if (result) this.cancelCommentEdit();
  }



  private loadTicketContext(): void {
    this.setSummaryFromTicket();

    if (!this.ticket?.taskId || this.activeTicketId === this.ticket.taskId) return;

    this.resetCommentDraft();
    this.commentState.clear();
    this.activeTicketId = this.ticket.taskId;
    this.commentState.setActiveTicket(this.ticket.taskId);
    this.commentState.loadCommentsByTicketId(this.ticket.taskId);
    this.loadTicketHistory(this.ticket.taskId);
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
You are a ticket summarizer. Your only job is to describe what the task/issue actually is, based on the information given.

Ticket Title: ${this.ticket?.title ?? '(no title provided)'}
Notes: ${referenceDescription}

Rules:
- Only summarize informative content: what is broken, what needs to be built, what the user is asking for. That is the only valid subject of your output.
- Completely ignore and never mention: image tags, video tags, audio tags, attachments, file names, URLs, links, HTML tags of any kind, formatting markup, or any reference to how the ticket was written, edited, or attached to. Treat these as if they were not in the input at all.
- Never refer to the ticket, its fields, or its history in your output.
- If the notes contain no real information about the task once the above is ignored, disregard them entirely and write a short, logical description based on the title alone — something a ticket with that title would reasonably be about.
- Output plain text only: 2-4 sentences, no HTML, no markdown, no labels, no quotes.
  `.trim();
  }

  private stripHtml(value: string): string {
    const container = document.createElement('div');
    container.innerHTML = value;

    // Convert media tags into a short text hint instead of losing them entirely
    container.querySelectorAll('img, video, audio').forEach((el) => {
      const label = el.getAttribute('alt') || el.getAttribute('title') || '';
      const hint = label ? `[attached media: ${label}]` : '[attached media]';
      el.replaceWith(document.createTextNode(hint));
    });

    return (container.textContent || '')
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
    return `
    Title: ${this.ticket?.title ?? ''}
    Description: ${this.ticket?.description ?? ''}
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

  private loadTicketHistory(taskId: string): void {
    this.isLoadingHistory = true;
    this.historyError = '';

    this.taskManageService.getTicketHistory(taskId).subscribe({
      next: (history) => {
        this.ticketHistory = history;
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.historyError = 'Failed to load ticket history.';
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      }
    });
  }

  private stripMediaTagsToUrls(html: string): string {
    const container = document.createElement('div');
    container.innerHTML = html;

    const mediaSelectors = ['img', 'video', 'audio', 'source'];

    mediaSelectors.forEach(tag => {
      container.querySelectorAll(tag).forEach(el => {
        const src = el.getAttribute('src') || el.getAttribute('data-src') || '';
        if (src) {
          const link = document.createElement('a');
          link.href = src;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = src;
          link.className = 'history-media-link';
          el.replaceWith(link);
        } else {
          el.remove();
        }
      });
    });

    return container.innerHTML;
  }



}
