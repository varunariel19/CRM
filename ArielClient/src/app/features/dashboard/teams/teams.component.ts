import { CommonModule, Location } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthState } from '../../../state/auth.state';
import { TeamsService } from '../../../services/teams.service';
import { TeamAttachmentType, TeamConversation, TeamConversationMember, TeamMessage, TeamMessageAttachment, TeamUser } from '../../../core/types/teams.type';
import { ComposerComponent } from "../../../components/items/message-composer/message-composer.component";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AttachmentViewerComponent } from "../../../components/items/attachment-viewer/attachment-viewer.component";
import { NotificationState } from '../../../state/notification.state';
import { DeepLinkService } from '../../../core/services/deepLink.service';
import { TeamState } from '../../../state/team.state';
import { UserProfileComponent } from '../../../components/items/user-profile/user-profile.component';


export interface PendingAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: TeamAttachmentType;
  contentType: string;
  previewUrl?: string;
  uploading?: boolean;
  uploadProgress?: number;
  uploadedUrl?: string;
  uploadFailed?: boolean;
}

export interface ScheduledTeamMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  scheduledAt: string;
  status: 'Pending' | 'Sent' | 'Cancelled' | 'Failed';
  jobId: string | null;
  createdAt: string;
  attachments: TeamMessageAttachment[];
}

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, ComposerComponent, AttachmentViewerComponent, UserProfileComponent],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsComponent implements OnInit, AfterViewChecked, OnDestroy {

  private readonly UNDO_WINDOW_MS = 5 * 60 * 1000;
  private teamsService = inject(TeamsService);
  private teamState = inject(TeamState);
  private authState = inject(AuthState);
  private sanitizer = inject(DomSanitizer);
  private notificationState = inject(NotificationState);
  private deepLink = inject(DeepLinkService);
  private location = inject(Location);

  private lastScrolledMessageCount = -1;
  private pendingScrollConversationId: string | null = null;

  private typingTimer?: ReturnType<typeof setTimeout>;
  private preloadedImages = new Set<string>();

  @ViewChild('messageInput') messageInputRef!: ElementRef<HTMLElement>;
  @ViewChild('messagesScroller') messagesScroller?: ElementRef<HTMLDivElement>;

  conversations = this.teamsService.conversations;
  users = this.teamState.teamMembers;
  onlineUserIds = this.teamsService.onlineUserIds;
  typing = this.teamsService.typing;

  currentUserId = computed(() => this.authState.userId());
  currentUserName = computed(() => this.authState.fullName() || 'You');
  selectedConversationId = signal<string | null>(null);
  messages = signal<TeamMessage[]>([]);
  search = signal('');
  messageBody = signal('');
  groupName = signal('');
  selectedMemberIds = signal<Set<string>>(new Set());
  selectedAddMemberIds = signal<Set<string>>(new Set());
  selectedAttachments = signal<PendingAttachment[]>([]);
  isCreatingGroup = signal(false);
  isLoadingMessages = signal(false);
  isSending = signal(false);
  openingUserId = signal<string | null>(null);
  isInfoPanelOpen = signal(false);
  isSidebarCollapsed = signal(false);

  hasMoreMessages = signal(false);
  isLoadingMoreMessages = signal(false);
  private readonly PAGE_SIZE = 40;
  private originalContentCache = new Map<string, string>();


  viewerAttachment = signal<TeamMessageAttachment | null>(null);
  viewerAttachments = signal<TeamMessageAttachment[]>([]);

  pendingDirect = signal<TeamUser | null>(null);

  editingMessageId = signal<string | null>(null);
  editingMessageContent = signal('');
  peopleSearch = signal('');

  scheduledMessages = signal<Record<string, ScheduledTeamMessage[]>>({});
  isLoadingScheduled = signal(false);
  cancellingScheduledId = signal<string | null>(null);

  selectedConversation = computed(() => this.conversations().find(c => c.id === this.selectedConversationId()) ?? null);
  availableUsers = computed(() => this.users().filter(u => u.id !== this.currentUserId()));
  filteredConversations = computed(() => {
    const term = this.search().trim().toLowerCase();
    const conversations = [...this.conversations()].sort((a, b) => this.sortByRecent(a, b));
    if (!term) return conversations;
    return conversations.filter(c => this.getConversationTitle(c).toLowerCase().includes(term));
  });

  searchedUsers = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term || this.isCreatingGroup()) return [];
    return this.availableUsers()
      .filter(user => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term))
      .slice(0, 8);
  });

  searchedMembers = computed(() => {
    const term = this.peopleSearch().trim().toLowerCase();
    return this.availableUsers()
      .filter(user => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term))
      .slice(0, 8);
  });

  addableGroupMembers = computed(() => {
    const conversation = this.selectedConversation();
    if (!conversation?.isGroup) return [];
    const existing = new Set(conversation.members.map(member => member.id));
    return this.availableUsers().filter(user => !existing.has(user.id));
  });
  canSend = computed(() => !!this.selectedConversationId() && !this.isSending() && (this.messageBody().trim().length > 0 || this.selectedAttachments().length > 0));
  typingLabel = computed(() => {
    const id = this.selectedConversationId();
    if (!id) return '';
    const names = this.typing()[id] ?? [];
    return names.length ? `${names.join(', ')} typing...` : '';
  });

  scheduledForCurrentConversation = computed(() => {
    const id = this.selectedConversationId();
    return id ? (this.scheduledMessages()[id] ?? []) : [];
  });

  constructor() {
    effect(() => {
      const conversationId = this.deepLink.pendingConversationId();
      if (conversationId) {
        this.openConversationFromUrl(conversationId);
      }
    });
  }



  ngOnInit(): void {
    this.notificationState.showMessageNotification.set(false);

    this.teamsService.loadConversations().subscribe(conversations => {
      this.teamsService.conversations.set(conversations);
      this.preloadImageUrls(conversations.map(c => this.getConversationProfileImage(c)));
    });

    this.teamsService.connect({
      onMessage: message => this.receiveMessage(message),
      onConversation: conversation => this.upsertConversation(conversation),
      onSeen: (conversationId, messageIds, seenById) => this.applyMessagesSeen(conversationId, messageIds, seenById),
      onMessageEdited: message => this.applyMessageEdited(message),
      onMessageDeleted: message => this.applyMessageDeleted(message),
      onMessageRestored: message => this.applyMessageRestored(message),
      onScheduledDelivered: (conversationId, scheduledMessageId) => this.applyScheduledMessageDelivered(conversationId, scheduledMessageId)
      // no lead handlers here — kept in leads component instead
    }).catch(err => console.error('Teams realtime connection failed', err));
  }

  ngOnDestroy(): void {
    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.selectedAttachments().forEach(attachment => this.revokePreview(attachment));

    this.selectedConversationId.set(null);
    this.notificationState.showMessageNotification.set(true);
    this.messages.set([]);
  }

  ngAfterViewChecked(): void {
    const msgs = this.messages();
    const convId = this.selectedConversationId();

    if (
      this.pendingScrollConversationId !== null &&
      this.pendingScrollConversationId === convId &&
      msgs.length !== this.lastScrolledMessageCount
    ) {
      this.lastScrolledMessageCount = msgs.length;
      this.pendingScrollConversationId = null;
      const scroller = this.messagesScroller?.nativeElement;
      if (scroller) {
        const isNearBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 200;
        if (isNearBottom || this.isLoadingMessages()) {
          this.scrollToBottom();
        }
      }
    }
  }

  handleSend(event: { content: string; attachments: PendingAttachment[]; scheduledAt?: string }): void {
    this.sendMessage(event);
  }

  handleTyping(isTyping: boolean): void {
    const conversationId = this.selectedConversationId();
    if (!conversationId) return;

    this.teamsService.sendTyping(conversationId, isTyping);

    if (this.typingTimer) clearTimeout(this.typingTimer);
    if (isTyping) {
      this.typingTimer = setTimeout(() => this.teamsService.sendTyping(conversationId, false), 1400);
    }
  }

  private applyScheduledMessageDelivered(conversationId: string, scheduledMessageId: string): void {
    this.scheduledMessages.update(map => {
      const list = map[conversationId];
      if (!list) return map;
      return {
        ...map,
        [conversationId]: list.filter(m => m.id !== scheduledMessageId),
      };
    });
  }

  openViewer(attachment: TeamMessageAttachment, allAttachments: TeamMessageAttachment[]) {
    this.viewerAttachment.set(attachment);
    this.viewerAttachments.set(allAttachments);
  }

  closeViewer() {
    this.viewerAttachment.set(null);
    this.viewerAttachments.set([]);
  }

  onInput(event: Event) {
    const el = event.target as HTMLElement;
    this.messageBody.set(el.innerHTML);
    this.setTyping();
  }

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  selectConversation(conversation: TeamConversation, updateUrl = true): void {
    if (conversation.id === this.selectedConversationId() && this.messages().length) return;
    this.selectedConversationId.set(conversation.id);
    this.lastScrolledMessageCount = -1;
    this.hasMoreMessages.set(false);
    this.selectedAddMemberIds.set(new Set());
    this.teamsService.joinConversation(conversation.id);
    if (updateUrl) this.location.go(`/dashboard/teams/${conversation.id}`);

    this.loadScheduledMessages(conversation.id);

    const cached = this.messagesCache.get(conversation.id);
    if (cached) {
      this.messages.set(cached);
      this.hasMoreMessages.set(cached.length === this.PAGE_SIZE);
      this.isLoadingMessages.set(false);
      this.scrollToBottom();
      setTimeout(() => this.scrollToBottom(), 150);
      this.markConversationRead(conversation.id);
      return;
    }

    this.messages.set([]);
    this.isLoadingMessages.set(true);
    this.teamsService.loadMessages(conversation.id, undefined, this.PAGE_SIZE).subscribe({
      next: messages => {
        this.messages.set(messages);
        this.messagesCache.set(conversation.id, messages);
        this.hasMoreMessages.set(messages.length === this.PAGE_SIZE);
        this.isLoadingMessages.set(false);
        this.preloadImageUrls(
          messages.flatMap(m => m.attachments.filter(a => a.attachmentType === 'image').map(a => a.fileUrl))
        );
        this.scrollToBottom();
        setTimeout(() => this.scrollToBottom(), 150);
        this.markConversationRead(conversation.id);
      },
      error: () => this.isLoadingMessages.set(false)
    });
  }

  loadScheduledMessages(conversationId: string): void {
    this.isLoadingScheduled.set(true);
    this.teamsService.loadScheduledMessages(conversationId).subscribe({
      next: scheduled => {
        this.scheduledMessages.update(map => ({
          ...map,
          [conversationId]: [...scheduled].sort(
            (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
          ),
        }));
        this.isLoadingScheduled.set(false);
      },
      error: () => this.isLoadingScheduled.set(false),
    });
  }

  cancelScheduledMessage(scheduled: ScheduledTeamMessage): void {
    if (this.cancellingScheduledId()) return;
    this.cancellingScheduledId.set(scheduled.id);

    this.teamsService.cancelScheduledMessage(scheduled.conversationId, scheduled.id).subscribe({
      next: () => {
        this.scheduledMessages.update(map => {
          const list = map[scheduled.conversationId] ?? [];
          return {
            ...map,
            [scheduled.conversationId]: list.filter(m => m.id !== scheduled.id),
          };
        });
        this.cancellingScheduledId.set(null);
      },
      error: () => this.cancellingScheduledId.set(null),
    });
  }

  loadMoreMessages(): void {
    const conversationId = this.selectedConversationId();
    const msgs = this.messages();
    if (!conversationId || this.isLoadingMoreMessages() || !this.hasMoreMessages() || msgs.length === 0) return;

    const oldestMessageId = msgs[0].id;
    const scroller = this.messagesScroller?.nativeElement;
    const scrollHeightBefore = scroller?.scrollHeight ?? 0;

    this.isLoadingMoreMessages.set(true);
    this.teamsService.loadMessages(conversationId, oldestMessageId, this.PAGE_SIZE).subscribe({
      next: older => {
        this.messages.update(current => [...older, ...current]);
        this.messagesCache.set(conversationId, this.messages());
        this.hasMoreMessages.set(older.length === this.PAGE_SIZE);
        this.isLoadingMoreMessages.set(false);

        if (scroller) {
          requestAnimationFrame(() => {
            const added = scroller.scrollHeight - scrollHeightBefore;
            scroller.scrollTop = added;
          });
        }
      },
      error: () => this.isLoadingMoreMessages.set(false)
    });
  }

  onMessagesScroll(event: Event): void {
    const el = event.target as HTMLDivElement;
    if (el.scrollTop <= 80 && this.hasMoreMessages() && !this.isLoadingMoreMessages()) {
      this.loadMoreMessages();
    }
  }

  startDirect(user: TeamUser): void {
    if (this.openingUserId()) return;

    const existing = this.findDirectConversation(user.id);
    if (existing) {
      this.pendingDirect.set(null);
      this.selectConversation(existing);
      this.search.set('');
      return;
    }

    this.selectedConversationId.set(null);
    this.messages.set([]);
    this.pendingDirect.set(user);
    this.search.set('');
  }

  toggleMember(userId: string): void {
    this.selectedMemberIds.update(current => this.toggleSet(current, userId));
  }

  toggleAddMember(userId: string): void {
    this.selectedAddMemberIds.update(current => this.toggleSet(current, userId));
  }

  createGroup(): void {
    this.teamsService.createGroup(this.groupName(), [...this.selectedMemberIds()]).subscribe(conversation => {
      this.groupName.set('');
      this.selectedMemberIds.set(new Set());
      this.isCreatingGroup.set(false);
      this.upsertConversation(conversation);
      this.selectConversation(conversation);
    });
  }

  closeGroupModal() {
    this.isCreatingGroup.set(false);
    this.groupName.set("");
    this.selectedMemberIds.set(new Set());
  }

  addMembersToGroup(): void {
    const conversation = this.selectedConversation();
    const memberIds = [...this.selectedAddMemberIds()];
    if (!conversation?.isGroup || memberIds.length === 0) return;

    this.teamsService.addGroupMembers(conversation.id, memberIds).subscribe(updated => {
      this.selectedAddMemberIds.set(new Set());
      this.upsertConversation(updated);
    });
  }

  sendMessage(event: { content: string; attachments: PendingAttachment[]; scheduledAt?: string }): void {
    const content = event.content.trim();
    const attachments = event.attachments;
    const scheduledAt = event.scheduledAt;
    const pending = this.pendingDirect();

    if (!content && attachments.length === 0) return;
    if (this.isSending()) return;

    const attachmentPayload = attachments.map(a => ({
      fileUrl: a.uploadedUrl!,
      fileName: a.name,
      contentType: a.contentType,
      attachmentType: a.type,
      sizeBytes: a.size,
    }));

    if (pending) {
      this.isSending.set(true);
      this.teamsService.createDirect(pending.id, content, attachmentPayload).subscribe({
        next: conversation => {
          attachments.forEach(a => this.revokePreview(a));
          this.pendingDirect.set(null);
          this.upsertConversation(conversation);
          this.selectConversation(conversation);
          this.isSending.set(false);
        },
        error: () => this.isSending.set(false),
      });
      return;
    }

    const conversationId = this.selectedConversationId();
    if (!conversationId) return;

    this.isSending.set(true);

    if (scheduledAt) {
      this.teamsService.sendMessage(conversationId, content, attachmentPayload, scheduledAt).subscribe({
        next: res => {
          attachments.forEach(a => this.revokePreview(a));
          this.isSending.set(false);
          this.addScheduledMessage(res.body as ScheduledTeamMessage);
        },
        error: () => this.isSending.set(false),
      });
      return;
    }

    const optimisticId = `pending-${crypto.randomUUID()}`;
    const optimisticMessage = this.buildOptimisticMessage(optimisticId, conversationId, content, attachments);
    this.messages.update(messages => [...messages, optimisticMessage]);
    this.messagesCache.set(conversationId, this.messages()); // ← sync cache
    this.queueScroll(conversationId);
    this.teamsService.sendTyping(conversationId, false);

    this.teamsService.sendMessage(conversationId, content, attachmentPayload).subscribe({
      next: res => {
        attachments.forEach(a => this.revokePreview(a));
        this.isSending.set(false);
        const saved = res.body as TeamMessage;
        this.replaceOptimisticMessage(optimisticId, saved);
        this.receiveMessage(saved);
      },
      error: () => {
        this.isSending.set(false);
        this.messages.update(messages => messages.map(m =>
          m.id === optimisticId ? { ...m, pending: false, failed: true } : m
        ));
        this.messagesCache.set(conversationId, this.messages());
      },
    });
  }

  setTyping(): void {
    const conversationId = this.selectedConversationId();
    if (!conversationId) return;
    this.teamsService.sendTyping(conversationId, this.messageBody().trim().length > 0);
    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => this.teamsService.sendTyping(conversationId, false), 1400);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const next = [...this.selectedAttachments(), ...files.map(file => this.toPendingAttachment(file))].slice(0, 8);
    this.selectedAttachments().forEach(attachment => {
      if (!next.some(item => item.id === attachment.id)) this.revokePreview(attachment);
    });
    this.selectedAttachments.set(next);
    input.value = '';
  }

  removeAttachment(id: string): void {
    this.selectedAttachments.update(attachments => {
      const removed = attachments.find(attachment => attachment.id === id);
      if (removed) this.revokePreview(removed);
      return attachments.filter(attachment => attachment.id !== id);
    });
  }

  getConversationTitle(conversation: TeamConversation): string {
    if (conversation.isGroup) return conversation.name ?? 'New group';
    if (this.isSelfChat(conversation)) return 'You (Note to Self)';
    return conversation.members.find(m => m.id !== this.currentUserId())?.name ?? 'Direct chat';
  }

  getConversationProfileImage(conversation: TeamConversation): string | null {
    if (conversation.isGroup) {
      return conversation.name ?? null;
    }
    return conversation.members.find(m => m.id !== this.currentUserId())?.profileImage ?? null;
  }

  getConversationAvatar(conversation: TeamConversation): string {
    return this.getInitials(this.getConversationTitle(conversation));
  }

  getInitials(name: string): string {
    return name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'U';
  }

  getMessagePreview(conversation: TeamConversation): string {
    const message = conversation.lastMessage;
    if (!message) return conversation.isGroup ? `${conversation.members.length} members` : 'No messages yet';
    if (message.content?.trim()) return message.content;
    const count = message.attachments?.length ?? 0;
    return count === 1 ? 'Sent an attachment' : `Sent ${count} attachments`;
  }

  getMemberName(userId: string): string {
    return this.users().find(u => u.id === userId)?.name ?? userId;
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  formatScheduledLabel(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    if (isToday) return `Today at ${time}`;
    if (isTomorrow) return `Tomorrow at ${time}`;
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ` at ${time}`;
  }

  isUserOnline(conversation: TeamConversation): boolean {
    if (conversation.isGroup) return false;
    const other = this.getOtherMember(conversation);
    return other ? this.onlineUserIds().has(other.id) : false;
  }

  getOtherMember(conversation: TeamConversation): TeamConversationMember | undefined {
    return conversation.members.find(m => m.id !== this.currentUserId());
  }

  hasUnread(conversation: TeamConversation): boolean {
    const lastMsg = conversation.lastMessage;
    const me = this.currentUserId();
    if (!lastMsg || !me || conversation.id === this.selectedConversationId() || lastMsg.senderId === me) return false;
    return !(lastMsg.seenByIds ?? []).includes(me);
  }

  isMessageSeen(message: TeamMessage): boolean {
    if (message.pending || message.failed) return false;
    const conversation = this.conversations().find(c => c.id === message.conversationId);
    const me = this.currentUserId();
    if (!conversation || !me || message.senderId !== me) return false;
    const otherIds = conversation.members.map(member => member.id).filter(id => id !== me);
    return otherIds.length > 0 && otherIds.every(id => message.seenByIds.includes(id));
  }

  getMessageReceipt(message: TeamMessage): 'pending' | 'seen' | 'delivered' | null {
    if (message.senderId !== this.currentUserId()) return null;
    if (message.failed) return null;
    const last = this.getLastMyMessage();
    if (!last || message.id !== last.id) return null;
    if (message.pending) return 'pending';
    return this.isMessageSeen(message) ? 'seen' : 'delivered';
  }

  getLastMyMessage(): TeamMessage | null {
    const myId = this.currentUserId();
    const msgs = this.messages();
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].senderId === myId && !msgs[i].failed) return msgs[i];
    }
    return null;
  }

  canUndoDelete(msg: TeamMessage): boolean {
    if (!msg.isDeleted || msg.senderId != this.authState.userId()) return false;
    const deletedAt = new Date(msg.updatedAt).getTime();
    return Date.now() < deletedAt + this.UNDO_WINDOW_MS;
  }

  undoDelete(msg: TeamMessage): void {
    this.teamsService.restoreMessage(msg.conversationId, msg.id).subscribe({
      next: updated => this.applyMessageRestored(updated),
      error: () => { }
    });
  }

  isFirstInRun(index: number): boolean {
    const msgs = this.messages();
    if (index <= 0) return true;
    const current = msgs[index];
    const previous = msgs[index - 1];
    if (!current || !previous) return true;
    return current.senderId !== previous.senderId;
  }

  isLastInRun(index: number): boolean {
    const msgs = this.messages();
    if (index >= msgs.length - 1) return true;
    const current = msgs[index];
    const next = msgs[index + 1];
    if (!current || !next) return true;
    return current.senderId !== next.senderId;
  }

  onEditInput(event: Event): void {
    const el = event.target as HTMLElement;
    this.editingMessageContent.set(el.innerHTML);
  }

  startEditMessage(msg: TeamMessage) {
    this.editingMessageId.set(msg.id);
    this.editingMessageContent.set(msg.content ?? '');
    if (!this.originalContentCache.has(msg.id)) {
      this.originalContentCache.set(msg.id, msg.content ?? '');
    }

    setTimeout(() => {
      const el = document.querySelector('.message-edit-input') as HTMLElement;
      if (!el) return;

      el.innerHTML = msg.content ?? '';
      el.focus();

      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
  }

  cancelEditMessage() {
    this.editingMessageId.set(null);
    this.editingMessageContent.set('');
  }

  saveEditMessage(msg: TeamMessage) {
    const content = this.editingMessageContent().trim();
    if (!content) return;

    this.teamsService.editMessage(msg.conversationId, msg.id, content).subscribe({
      next: updated => {
        this.applyMessageEdited(updated);
        this.cancelEditMessage();
      },
      error: () => { }
    });
  }

  deleteMessage(msg: TeamMessage) {
    this.teamsService.deleteMessage(msg.conversationId, msg.id).subscribe({
      next: () => this.applyMessageDeleted({ ...msg, isDeleted: true, content: '' }),
      error: () => { }
    });
  }

  private addScheduledMessage(scheduled: ScheduledTeamMessage): void {
    this.scheduledMessages.update(map => {
      const list = map[scheduled.conversationId] ?? [];
      return {
        ...map,
        [scheduled.conversationId]: [...list, scheduled].sort(
          (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        ),
      };
    });
  }

  trackByConversation = (_: number, conversation: TeamConversation) => conversation.id;
  trackByUser = (_: number, user: TeamUser) => user.id;
  trackByMember = (_: number, member: TeamConversationMember) => member.id;
  trackByMessage = (_: number, message: TeamMessage) => message.id;
  trackByAttachment = (_: number, attachment: TeamMessageAttachment | PendingAttachment) => attachment.id;
  trackByScheduled = (_: number, message: ScheduledTeamMessage) => message.id;


  private preloadImageUrls(urls: (string | null | undefined)[]): void {
    for (const url of urls) {
      if (!url || this.preloadedImages.has(url)) continue;
      this.preloadedImages.add(url);
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    }
  }

  private applyMessageEdited(message: TeamMessage): void {
    if (message.conversationId === this.selectedConversationId()) {
      this.messages.update(messages => messages.map(m => m.id === message.id ? message : m));
      this.messagesCache.set(message.conversationId, this.messages());
    } else {
      const cached = this.messagesCache.get(message.conversationId);
      if (cached) this.messagesCache.set(message.conversationId, cached.map(m => m.id === message.id ? message : m));
    }

    this.teamsService.conversations.update(conversations => conversations.map(c =>
      c.id === message.conversationId && c.lastMessage?.id === message.id
        ? { ...c, lastMessage: message }
        : c
    ));
  }

  private applyMessageDeleted(message: TeamMessage): void {
    const currentTime = new Date(Date.now()).toString();
    const patch = (m: TeamMessage) => m.id === message.id ? { ...m, isDeleted: true, updatedAt: currentTime, content: '' } : m;

    if (message.conversationId === this.selectedConversationId()) {
      this.messages.update(messages => messages.map(patch));
      this.messagesCache.set(message.conversationId, this.messages());
    } else {
      const cached = this.messagesCache.get(message.conversationId);
      if (cached) this.messagesCache.set(message.conversationId, cached.map(patch));
    }

    this.teamsService.conversations.update(conversations => conversations.map(c =>
      c.id === message.conversationId && c.lastMessage?.id === message.id
        ? { ...c, lastMessage: { ...c.lastMessage, isDeleted: true, content: '' } }
        : c
    ));
  }

  private applyMessageRestored(message: TeamMessage): void {
    if (message.conversationId === this.selectedConversationId()) {
      this.messages.update(messages => messages.map(m => m.id === message.id ? message : m));
      this.messagesCache.set(message.conversationId, this.messages());
    } else {
      const cached = this.messagesCache.get(message.conversationId);
      if (cached) this.messagesCache.set(message.conversationId, cached.map(m => m.id === message.id ? message : m));
    }

    this.teamsService.conversations.update(conversations => conversations.map(c =>
      c.id === message.conversationId && c.lastMessage?.id === message.id
        ? { ...c, lastMessage: message }
        : c
    ));
  }

private receiveMessage(message: TeamMessage): void {
  if (message.conversationId === this.selectedConversationId()) {
    this.notificationState.playMessageReceivedSound();

    this.messages.update(messages => {
      const withoutPending = messages.filter(existing =>
        !existing.id.startsWith('pending-') || existing.content !== message.content
      );
      return withoutPending.some(m => m.id === message.id) ? withoutPending : [...withoutPending, message];
    });
    this.messagesCache.set(message.conversationId, this.messages());
    this.queueScroll(message.conversationId);
    this.markConversationRead(message.conversationId);
  } else {
    const cached = this.messagesCache.get(message.conversationId);
    if (cached) {
      const withoutPending = cached.filter(existing =>
        !existing.id.startsWith('pending-') || existing.content !== message.content
      );
      const updated = withoutPending.some(m => m.id === message.id)
        ? withoutPending
        : [...withoutPending, message];
      this.messagesCache.set(message.conversationId, updated);
    }
  }

  this.teamsService.conversations.update(conversations => conversations.map(c =>
    c.id === message.conversationId
      ? { ...c, lastMessage: message, lastMessageAt: message.createdAt }
      : c
  ).sort((a, b) => this.sortByRecent(a, b)));
}

  private upsertConversation(conversation: TeamConversation): void {
    this.teamsService.conversations.update(conversations => {
      const exists = conversations.some(c => c.id === conversation.id);
      const next = exists
        ? conversations.map(c => c.id === conversation.id ? conversation : c)
        : [conversation, ...conversations];
      return next.sort((a, b) => this.sortByRecent(a, b));
    });
  }

  private applyMessagesSeen(conversationId: string, messageIds: string[], seenById: string): void {
    const ids = new Set(messageIds);
    const appendSeen = (message: TeamMessage): TeamMessage => ids.has(message.id) && !message.seenByIds.includes(seenById)
      ? { ...message, seenByIds: [...message.seenByIds, seenById] }
      : message;

    if (conversationId === this.selectedConversationId()) {
      this.messages.update(messages => messages.map(appendSeen));
      this.messagesCache.set(conversationId, this.messages());
    } else {
      const cached = this.messagesCache.get(conversationId);
      if (cached) this.messagesCache.set(conversationId, cached.map(appendSeen));
    }

    this.teamsService.conversations.update(conversations => conversations.map(conversation => {
      if (conversation.id !== conversationId || !conversation.lastMessage) return conversation;
      return { ...conversation, lastMessage: appendSeen(conversation.lastMessage) };
    }));
  }

  private markConversationRead(conversationId: string): void {
    const me = this.currentUserId();
    if (!me) return;
    this.teamsService.markRead(conversationId).subscribe(() => {
      this.teamsService.conversations.update(conversations => conversations.map(conversation => {
        if (conversation.id !== conversationId || !conversation.lastMessage || conversation.lastMessage.seenByIds.includes(me)) return conversation;
        return {
          ...conversation,
          lastMessage: {
            ...conversation.lastMessage,
            seenByIds: [...conversation.lastMessage.seenByIds, me]
          }
        };
      }));
    });
  }

  private buildOptimisticMessage(id: string, conversationId: string, content: string, attachments: PendingAttachment[]): TeamMessage {
    return {
      id,
      conversationId,
      senderId: this.currentUserId() ?? '',
      seenByIds: [this.currentUserId() ?? ''].filter(Boolean),
      senderName: this.currentUserName(),
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: attachments.map(attachment => ({
        id: attachment.id,
        fileName: attachment.name,
        fileUrl: attachment.previewUrl ?? '',
        uploadId: '',
        contentType: attachment.contentType,
        attachmentType: attachment.type,
        sizeBytes: attachment.size,
        createdAt: new Date().toISOString(),
      })),
      pending: true,
    };
  }

  private replaceOptimisticMessage(id: string, saved: TeamMessage): void {
    if (saved.conversationId === this.selectedConversationId()) {
      this.messages.update(messages => messages.map(message => message.id === id ? saved : message));
      this.messagesCache.set(saved.conversationId, this.messages());
    } else {
      const cached = this.messagesCache.get(saved.conversationId);
      if (cached) {
        this.messagesCache.set(saved.conversationId, cached.map(m => m.id === id ? saved : m));
      }
    }
  }

  private toPendingAttachment(file: File): PendingAttachment {
    const type = this.getAttachmentType(file);
    return {
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type,
      contentType: file.type || 'application/octet-stream',
      previewUrl: type === 'image' || type === 'audio' || type === 'video' ? URL.createObjectURL(file) : undefined,
    };
  }

  private getAttachmentType(file: File): TeamAttachmentType {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    if (/\.(pdf|docx?|xlsx?|pptx?|txt|csv)$/i.test(file.name)) return 'document';
    return 'file';
  }

  private revokePreview(attachment: PendingAttachment): void {
    if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
  }

  private queueScroll(conversationId: string): void {
    this.pendingScrollConversationId = conversationId;
    this.scrollToBottom('smooth');
  }

  private scrollToBottom(behavior: ScrollBehavior = 'smooth'): void {
    const element = this.messagesScroller?.nativeElement;
    if (!element) return;
    setTimeout(() => {
      element.scrollTop = element.scrollHeight + 9999;
    }, 50);
  }

  private sortByRecent(a: TeamConversation, b: TeamConversation): number {
    return new Date(b.lastMessageAt ?? b.createdAt).getTime() - new Date(a.lastMessageAt ?? a.createdAt).getTime();
  }

  private findDirectConversation(userId: string): TeamConversation | undefined {
    const me = this.currentUserId();
    return this.conversations().find(conversation =>
      !conversation.isGroup &&
      conversation.members.some(member => member.id === userId) &&
      conversation.members.some(member => member.id === me)
    );
  }

  private toggleSet(current: Set<string>, value: string): Set<string> {
    const next = new Set(current);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  }

  private openConversationFromUrl(conversationId: string): void {
    const conversation = this.conversations().find(c => c.id === conversationId);
    if (!conversation) return;

    this.selectConversation(conversation, false);
    this.deepLink.pendingConversationId.set(null);
  }


  private messagesCache = new Map<string, TeamMessage[]>();
  private prefetchInFlight = new Set<string>();


  prefetchConversation(conversationId: string): void {
    if (this.messagesCache.has(conversationId) || this.prefetchInFlight.has(conversationId)) return;
    this.prefetchInFlight.add(conversationId);

    this.teamsService.loadMessages(conversationId, undefined, this.PAGE_SIZE).subscribe({
      next: messages => {
        this.messagesCache.set(conversationId, messages);
        this.preloadImageUrls(
          messages.flatMap(m => m.attachments.filter(a => a.attachmentType === 'image').map(a => a.fileUrl))
        );
        this.prefetchInFlight.delete(conversationId);
      },
      error: () => this.prefetchInFlight.delete(conversationId),
    });
  }



  private readonly FAVORITES_STORAGE_KEY = 'teams-favorite-conversations';

  favoriteIds = signal<Set<string>>(this.loadFavoritesFromStorage());

  private loadFavoritesFromStorage(): Set<string> {
    try {
      const raw = localStorage.getItem(this.FAVORITES_STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  private persistFavorites(ids: Set<string>): void {
    localStorage.setItem(this.FAVORITES_STORAGE_KEY, JSON.stringify([...ids]));
  }

  toggleFavorite(conversationId: string, event?: Event): void {
    event?.stopPropagation();
    this.favoriteIds.update(current => {
      const next = new Set(current);
      next.has(conversationId) ? next.delete(conversationId) : next.add(conversationId);
      this.persistFavorites(next);
      return next;
    });
  }

  isFavorite(conversationId: string): boolean {
    return this.favoriteIds().has(conversationId);
  }

  isSelfChat(conversation: TeamConversation): boolean {
    return !conversation.isGroup && conversation.members.length === 1 && conversation.members[0].id === this.currentUserId();
  }

  selfConversation = computed(() => this.conversations().find(c => this.isSelfChat(c)) ?? null);

  favoriteConversations = computed(() =>
    this.filteredConversations().filter(c => this.favoriteIds().has(c.id) && !this.isSelfChat(c))
  );

  directConversations = computed(() =>
    this.filteredConversations().filter(c => !c.isGroup && !this.favoriteIds().has(c.id) && !this.isSelfChat(c))
  );

  groupConversations = computed(() =>
    this.filteredConversations().filter(c => c.isGroup && !this.favoriteIds().has(c.id))
  );

  openSelfChat(): void {
    const existing = this.selfConversation();
    if (existing) {
      this.selectConversation(existing);
      return;
    }
    this.selectedConversationId.set(null);
    this.messages.set([]);
    this.pendingDirect.set({
      id: this.currentUserId() ?? '',
      name: 'You',
      email: '',
      profileImage: null,
    } as TeamUser);
    this.search.set('');
  }
}
