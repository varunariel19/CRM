import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-view-ticket',
  imports: [CommonModule, FormsModule, EditorModule],
  templateUrl: './view-ticket.component.html',
  styleUrls: ['./view-ticket.component.css']
})
export class ViewTicketComponent {

  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  activeTab: 'all' | 'comments' | 'history' = 'all';
  isEditingDescription = false;
  isGeneratingSummary = false;
  isAiGlowing = false;
  newComment = '';

  // Holds the HTML content for PrimeNG editor
  htmlContent = '';

  // Comment editing state
  editingCommentIndex: number | null = null;
  editingCommentText = '';

  ticket = {
    id: '3591',
    title: 'Remove Admin Access for User Account',
    status: 'TODO',
    priority: 'High',
    type: 'FEATURE',
    assignedTo: 'User',
    reportedBy: 'Admin User',
    createdAt: 'March 31, 2026 at 8:00 PM',
    updatedAt: 'June 5, 2026 at 12:59 PM',
    description: `<p>The task involves investigating and resolving the issue with the admin dashboard functionality, which is not displaying complete or accurate data.</p><p>To resolve this, we need to identify the root cause, which may be related to software updates, configuration changes, or database connectivity problems.</p><p>The goal is to restore the dashboard to its normal operational state, ensuring administrators have access to accurate information.</p>`
  };

  summaryPoints = [
    'The admin dashboard functionality is not displaying complete or accurate data.',
    'The root cause may be related to software updates.',
    'The issue may be related to configuration changes.',
    'The issue may be related to database connectivity problems.',
    'The goal is to restore the dashboard to its normal operational state.',
    'Administrators need access to accurate information.'
  ];

  comments: {
    user: string;
    date: string;
    message: string;
    editedAt?: string;
  }[] = [
    { user: 'Admin User', date: 'March 31, 2026 at 8:00 PM', message: 'Hi' },
    { user: 'Admin User', date: 'March 31, 2026 at 8:01 PM', message: "Let's investigate the admin dashboard functionality to determine the root cause and restore normal operations." }
  ];

  constructor(private sanitizer: DomSanitizer) {}

  // ── Safe HTML for view mode ───────────────────────────────────────────
  get safeDescription(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.ticket.description);
  }

  // ── Rich Text Editor (PrimeNG) ───────────────────────────────────────

  startEditing() {
    this.htmlContent = this.ticket.description;
    this.isEditingDescription = true;
  }

  saveDescription() {
    this.ticket.description = this.htmlContent;
    this.isEditingDescription = false;
  }

  cancelEditing() {
    this.isEditingDescription = false;
  }

  // ── AI Summary ────────────────────────────────────────────────────────

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

  // ── Comments ──────────────────────────────────────────────────────────

  submitComment() {
    const msg = this.newComment.trim();
    if (!msg) return;
    this.comments.push({
      user: 'Admin User',
      date: new Date().toLocaleString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
      }),
      message: msg
    });
    this.newComment = '';
  }

  startEditingComment(index: number) {
    this.editingCommentIndex = index;
    this.editingCommentText = this.comments[index].message;
  }

  onCommentKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.saveCommentEdit(index);
    }
    if (event.key === 'Escape') {
      this.cancelCommentEdit();
    }
  }

  saveCommentEdit(index: number) {
    const msg = this.editingCommentText.trim();
    if (!msg) return;
    this.comments[index].message = msg;
    this.comments[index].editedAt = new Date().toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
    this.cancelCommentEdit();
  }

  cancelCommentEdit() {
    this.editingCommentIndex = null;
    this.editingCommentText = '';
  }

  insertQuickReply(text: string) {
    this.newComment = text;
  }

  // ── Misc ──────────────────────────────────────────────────────────────

  close() {
    this.closeModal.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }
}