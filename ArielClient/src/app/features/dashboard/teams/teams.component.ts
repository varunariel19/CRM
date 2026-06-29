import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthState } from '../../../state/auth.state';
import { TeamsService } from '../../../services/teams.service';
import { TeamAttachmentType, TeamConversation, TeamConversationMember, TeamMessage, TeamMessageAttachment, TeamUser } from '../../../core/types/teams.type';
import { ComposerComponent } from "../../../components/items/message-composer/message-composer.component";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AttachmentViewerComponent } from "../../../components/items/attachment-viewer/attachment-viewer.component";


interface PendingAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: TeamAttachmentType;
  contentType: string;
  previewUrl?: string;
}

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, ComposerComponent, AttachmentViewerComponent],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsComponent implements OnInit, AfterViewChecked, OnDestroy {
  private teamsService = inject(TeamsService);
  private authState = inject(AuthState);
  private sanitizer = inject(DomSanitizer);

  private lastScrolledMessageCount = -1;
  private pendingScrollConversationId: string | null = null;

  private typingTimer?: ReturnType<typeof setTimeout>;

  @ViewChild('messageInput') messageInputRef!: ElementRef<HTMLElement>;
  @ViewChild('messagesScroller') messagesScroller?: ElementRef<HTMLDivElement>;



  conversations = this.teamsService.conversations;
  users = this.teamsService.users;
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

  viewerAttachment = signal<TeamMessageAttachment | null>(null);
  viewerAttachments = signal<TeamMessageAttachment[]>([]);

  pendingDirect = signal<TeamUser | null>(null);



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

  ngOnInit(): void {
    document.querySelector('.inner-content')?.classList.add('no-scroll');

    this.teamsService.loadUsers().subscribe(users => this.teamsService.users.set(users));

    // No conversation is auto-selected on load — user must choose one explicitly
    this.teamsService.loadConversations().subscribe(conversations => {
      this.teamsService.conversations.set(conversations);
    });

    this.teamsService.connect(
      message => this.receiveMessage(message),
      conversation => this.upsertConversation(conversation),
      (conversationId, messageIds, seenById) => this.applyMessagesSeen(conversationId, messageIds, seenById)
    ).catch(err => console.error('Teams realtime connection failed', err));
  }

  ngOnDestroy(): void {
    document.querySelector('.inner-content')?.classList.remove('no-scroll');
    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.selectedAttachments().forEach(attachment => this.revokePreview(attachment));

    this.selectedConversationId.set(null);
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

  selectConversation(conversation: TeamConversation): void {
    if (conversation.id === this.selectedConversationId() && this.messages().length) return;
    this.selectedConversationId.set(conversation.id);
    this.messages.set([]);
    this.lastScrolledMessageCount = -1;
    this.hasMoreMessages.set(false);
    this.selectedAddMemberIds.set(new Set());
    this.isLoadingMessages.set(true);
    this.teamsService.joinConversation(conversation.id);
    this.teamsService.loadMessages(conversation.id, undefined, this.PAGE_SIZE).subscribe({
      next: messages => {
        this.messages.set(messages);
        this.hasMoreMessages.set(messages.length === this.PAGE_SIZE);
        this.isLoadingMessages.set(false);
        // Double-fire: once after signal update, once after paint
        this.scrollToBottom();
        setTimeout(() => this.scrollToBottom(), 150);
        this.markConversationRead(conversation.id);
      },
      error: () => this.isLoadingMessages.set(false)
    });
  }


  loadMoreMessages(): void {
    const conversationId = this.selectedConversationId();
    const msgs = this.messages();
    if (!conversationId || this.isLoadingMoreMessages() || !this.hasMoreMessages() || msgs.length === 0) return;

    const oldestMessageId = msgs[0].id;
    const scroller = this.messagesScroller?.nativeElement;
    // Capture scroll height before new messages are prepended
    const scrollHeightBefore = scroller?.scrollHeight ?? 0;

    this.isLoadingMoreMessages.set(true);
    this.teamsService.loadMessages(conversationId, oldestMessageId, this.PAGE_SIZE).subscribe({
      next: older => {
        this.messages.update(current => [...older, ...current]);
        this.hasMoreMessages.set(older.length === this.PAGE_SIZE);
        this.isLoadingMoreMessages.set(false);

        // Restore scroll position so user stays at the same message
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
    // Trigger load when user is within 80px of the top
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

  addMembersToGroup(): void {
    const conversation = this.selectedConversation();
    const memberIds = [...this.selectedAddMemberIds()];
    if (!conversation?.isGroup || memberIds.length === 0) return;

    this.teamsService.addGroupMembers(conversation.id, memberIds).subscribe(updated => {
      this.selectedAddMemberIds.set(new Set());
      this.upsertConversation(updated);
    });
  }

  sendMessage(): void {
    debugger;
    const content = this.messageBody().trim();
    const attachments = this.selectedAttachments();
    const pending = this.pendingDirect();

    if (pending) {
      if (this.isSending() || (!content && attachments.length === 0)) return;

      this.isSending.set(true);
      this.teamsService.createDirect(pending.id, content, attachments.map(a => a.file)).subscribe({
        next: conversation => {
          this.pendingDirect.set(null);
          this.upsertConversation(conversation);
          this.selectConversation(conversation);
          this.messageBody.set('');
          this.messageInputRef.nativeElement.innerHTML = '';
          this.selectedAttachments.set([]);
          this.isSending.set(false);
        },
        error: () => this.isSending.set(false)
      });
      return;
    }

    const conversationId = this.selectedConversationId();
    if (!conversationId || this.isSending() || (!content && attachments.length === 0)) return;

    const optimisticId = `pending-${crypto.randomUUID()}`;
    const optimisticMessage = this.buildOptimisticMessage(optimisticId, conversationId, content, attachments);
    this.messages.update(messages => [...messages, optimisticMessage]);
    this.queueScroll(conversationId);

    this.messageBody.set('');
    this.messageInputRef.nativeElement.innerHTML = '';
    this.selectedAttachments.set([]);
    this.isSending.set(true);
    this.teamsService.sendTyping(conversationId, false);

    this.teamsService.sendMessage(conversationId, content, attachments.map(a => a.file)).subscribe({
      next: saved => {
        attachments.forEach(attachment => this.revokePreview(attachment));
        this.isSending.set(false);
        this.replaceOptimisticMessage(optimisticId, saved);
        this.receiveMessage(saved);
      },
      error: () => {
        this.isSending.set(false);
        this.messages.update(messages => messages.map(message =>
          message.id === optimisticId ? { ...message, pending: false, failed: true } : message
        ));
      }
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
    return conversation.members.find(m => m.id !== this.currentUserId())?.name ?? 'Direct chat';
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

  onEnterSend(event: Event): void {
    if ((event as KeyboardEvent).shiftKey) return;
    event.preventDefault();
    this.sendMessage();
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


  handleSend(event: { content: string; attachments: PendingAttachment[] }) {
    debugger;
    const { content, attachments } = event;
    const pending = this.pendingDirect();

    if (pending) {
      this.isSending.set(true);
      this.teamsService.createDirect(pending.id, content, attachments.map(a => a.file)).subscribe({
        next: conversation => {
          attachments.forEach(a => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
          this.pendingDirect.set(null);
          this.upsertConversation(conversation);
          this.selectConversation(conversation);
          this.isSending.set(false);
        },
        error: () => this.isSending.set(false)
      });
      return;
    }

    // Normal flow — existing conversation
    const conversationId = this.selectedConversationId();
    if (!conversationId) return;

    const optimisticId = `pending-${crypto.randomUUID()}`;
    const optimisticMessage = this.buildOptimisticMessage(optimisticId, conversationId, content, attachments);
    this.messages.update(messages => [...messages, optimisticMessage]);
    this.queueScroll(conversationId);
    this.isSending.set(true);
    this.teamsService.sendTyping(conversationId, false);

    this.teamsService.sendMessage(conversationId, content, attachments.map(a => a.file)).subscribe({
      next: saved => {
        attachments.forEach(a => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
        this.isSending.set(false);
        this.replaceOptimisticMessage(optimisticId, saved);
        this.receiveMessage(saved);
      },
      error: () => {
        this.isSending.set(false);
        this.messages.update(messages => messages.map(m =>
          m.id === optimisticId ? { ...m, pending: false, failed: true } : m
        ));
      }
    });
  }

  handleTyping(isTyping: boolean) {
    const conversationId = this.selectedConversationId();
    if (!conversationId) return;
    this.teamsService.sendTyping(conversationId, isTyping);
  }

  trackByConversation = (_: number, conversation: TeamConversation) => conversation.id;
  trackByUser = (_: number, user: TeamUser) => user.id;
  trackByMember = (_: number, member: TeamConversationMember) => member.id;
  trackByMessage = (_: number, message: TeamMessage) => message.id;
  trackByAttachment = (_: number, attachment: TeamMessageAttachment | PendingAttachment) => attachment.id;

  private receiveMessage(message: TeamMessage): void {
    if (message.conversationId === this.selectedConversationId()) {
      this.messages.update(messages => {
        const withoutPending = messages.filter(existing =>
          !existing.id.startsWith('pending-') || existing.content !== message.content
        );
        return withoutPending.some(m => m.id === message.id) ? withoutPending : [...withoutPending, message];
      });
      // Scroll for both incoming messages from others and confirmed sent messages
      this.queueScroll(message.conversationId);
      this.markConversationRead(message.conversationId);
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
    this.messages.update(messages => messages.map(message => message.id === id ? saved : message));
    // No scroll here — message count hasn't changed (replace, not append),
    // and receiveMessage() will handle scrolling when the confirmed copy arrives
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
}