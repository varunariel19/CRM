import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EditorModule } from 'primeng/editor';
import { Task, TaskPriority, TaskStatus, TaskType } from '../../services/task-management.service';
import { ProjectMember } from '../../features/dashboard/projects/projects.component';
import { CommentState, TicketComment } from '../../state/comment.state';
import { AuthState } from '../../state/auth.state';

@Component({
  selector: 'app-view-ticket',
  imports: [CommonModule, FormsModule, EditorModule],
  templateUrl: './view-ticket.component.html',
  styleUrls: ['./view-ticket.component.css']
})


export class ViewTicketComponent implements OnInit, OnDestroy {

  @Input() isOpen = false;
  @Input({ required: true }) ticket!: Task;
  @Input({ required: true }) projectMembers!: ProjectMember[];
  @Output() closeModal = new EventEmitter<void>();

  readonly priorities: TaskPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  readonly types: TaskType[] = ['FEATURE', 'BUG', 'TASK', 'CHORE'];
  readonly statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  activeTab: 'all' | 'comments' | 'history' = 'all';
  isEditingDescription = false;
  isGeneratingSummary = false;
  isAiGlowing = false;




  summaryPoints = [
    'The admin dashboard functionality is not displaying complete or accurate data.',
    'The root cause may be related to software updates.',
    'The issue may be related to configuration changes.',
    'The issue may be related to database connectivity problems.',
    'The goal is to restore the dashboard to its normal operational state.',
    'Administrators need access to accurate information.'
  ];


  newComment = '';
  htmlContent = '';
  editingCommentId: string | null = null;
  editingCommentText = '';

  private readonly commentState = inject(CommentState);
  private authState = inject(AuthState);

  comments = this.commentState.sortedComments;
  isLoading = this.commentState.isLoading;
  commentError = this.commentState.error;
  isSubmitting = (id: string) => this.commentState.isCommentSubmitting(id);


  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.commentState.setActiveTicket(this.ticket.taskId);
    this.commentState.loadCommentsByTicketId(this.ticket.taskId);
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
    this.isEditingDescription = true;
  }

  saveDescription() {
    this.ticket.description = this.htmlContent;
    this.isEditingDescription = false;
  }

  cancelEditing() {
    this.isEditingDescription = false;
  }


  generateSummary() {
    if (this.isGeneratingSummary) return;
    this.isGeneratingSummary = true;
    this.isAiGlowing = true;
    setTimeout(() => {
      this.summaryPoints = [
        'Admin dashboard is failing to show complete or accurate data.',
        'Root cause investigation is required across software, config, and DB layers.',
        'Configuration changes may have introduced the regression.',
        'Database connectivity issues are a likely contributing factor.',
        'Restoration of dashboard to normal operational state is the primary goal.',
        'Accurate data access for administrators must be ensured post-fix.'
      ];
      this.isGeneratingSummary = false;
      setTimeout(() => { this.isAiGlowing = false; }, 3000);
    }, 1800);
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
    this.closeModal.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }
}