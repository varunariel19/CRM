import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthState } from '../../../state/auth.state';
import { TeamsService } from '../../../services/teams.service';
import { TeamAttachmentType, TeamCallSignal, TeamConversation, TeamConversationMember, TeamMessage, TeamMessageAttachment, TeamUser } from '../../../core/types/teams.type';

interface PendingAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: TeamAttachmentType;
  contentType: string;
  previewUrl?: string;
}

interface MessageSegment {
  type: 'text' | 'code';
  content: string;
}

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsComponent implements OnInit, AfterViewChecked, OnDestroy {
  private teamsService = inject(TeamsService);
  private authState = inject(AuthState);
  private shouldScrollToBottom = false;
  private typingTimer?: ReturnType<typeof setTimeout>;

  @ViewChild('messageInput') messageInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('messagesScroller') messagesScroller?: ElementRef<HTMLDivElement>;

  conversations = this.teamsService.conversations;
  users = this.teamsService.users;
  onlineUserIds = this.teamsService.onlineUserIds;
  typing = this.teamsService.typing;
  incomingCall = this.teamsService.incomingCall;

  currentUserId = computed(() => this.authState.userId());
  currentUserName = computed(() => this.authState.fullName() || 'You');
  selectedConversationId = signal<string | null>(null);
  messages = signal<TeamMessage[]>([]);
  search = signal('');
  messageBody = signal('');
  groupName = signal('');
  selectedMemberIds = signal<Set<string>>(new Set());
  selectedAttachments = signal<PendingAttachment[]>([]);
  isCreatingGroup = signal(false);
  isLoadingMessages = signal(false);
  isSending = signal(false);
  activeCall = signal<{ callId: string; callType: 'voice' | 'video'; conversationId: string; status: string } | null>(null);

  // Sidebar & section collapse state
  isSidebarCollapsed = signal(false);
  isChatsCollapsed = signal(false);
  isPeopleCollapsed = signal(false);

  selectedConversation = computed(() => this.conversations().find(c => c.id === this.selectedConversationId()) ?? null);
  filteredConversations = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.conversations();
    return this.conversations().filter(c => this.getConversationTitle(c).toLowerCase().includes(term));
  });
  availableUsers = computed(() => this.users().filter(u => u.id !== this.currentUserId()));
  canSend = computed(() => !!this.selectedConversationId() && !this.isSending() && (this.messageBody().trim().length > 0 || this.selectedAttachments().length > 0));
  typingLabel = computed(() => {
    const id = this.selectedConversationId();
    if (!id) return '';
    const names = this.typing()[id] ?? [];
    return names.length ? `${names.join(', ')} typing...` : '';
  });

  constructor() {
    effect(() => {
      const call = this.incomingCall();
      if (!call) return;
      if (call.signalType === 'incoming') {
        this.activeCall.set({ callId: call.callId, callType: call.callType, conversationId: call.conversationId, status: `Incoming ${call.callType} call from ${call.fromName}` });
      }
      if (call.signalType === 'accepted') this.activeCall.update(active => active ? { ...active, status: `${call.fromName} joined the call` } : active);
      if (call.signalType === 'declined' || call.signalType === 'ended') this.activeCall.set(null);
    });
  }

ngOnInit(): void {
  document.querySelector('.inner-content')?.classList.add('no-scroll');

  this.teamsService.loadUsers().subscribe(users => this.teamsService.users.set(users));
  this.teamsService.loadConversations().subscribe(conversations => {
    this.teamsService.conversations.set(conversations);
    if (!this.selectedConversationId() && conversations.length) this.selectConversation(conversations[0]);
  });

  this.teamsService.connect(
    message => this.receiveMessage(message),
    conversation => this.upsertConversation(conversation)
  ).catch(err => console.error('Teams realtime connection failed', err));
}

ngOnDestroy(): void {
  document.querySelector('.inner-content')?.classList.remove('no-scroll');

  if (this.typingTimer) clearTimeout(this.typingTimer);
  this.selectedAttachments().forEach(attachment => this.revokePreview(attachment));
}

  ngAfterViewChecked(): void {
    if (!this.shouldScrollToBottom) return;
    this.shouldScrollToBottom = false;
    this.scrollToBottom();
  }


// ── Add to your component signals ─────────────────────────────────────────
isInfoPanelOpen = signal(false);

// ── Add these helpers ──────────────────────────────────────────────────────
getMemberName(userId: string): string {
  const user = this.availableUsers().find(u => u.id === userId);
  return user?.name ?? userId;
}

isFirstInRun(index: number): boolean {
  const msgs = this.messages();

  if (index <= 0) return true;

  const current = msgs[index];
  const previous = msgs[index - 1];

  return !!current && !!previous && current.senderId !== previous.senderId;
}

isLastInRun(index: number): boolean {
  const msgs = this.messages();

  if (index >= msgs.length - 1) return true;

  const current = msgs[index];
  const next = msgs[index + 1];

  return !!current && !!next && current.senderId !== next.senderId;
}



  selectConversation(conversation: TeamConversation): void {
    if (conversation.id === this.selectedConversationId() && this.messages().length) return;
    this.selectedConversationId.set(conversation.id);
    this.messages.set([]);
    this.isLoadingMessages.set(true);
    this.teamsService.joinConversation(conversation.id);
    this.teamsService.loadMessages(conversation.id).subscribe({
      next: messages => {
        this.messages.set(messages);
        this.isLoadingMessages.set(false);
        this.queueScroll();
        // Mark read → update the current user's lastReadAt locally so unread dot clears immediately
        this.teamsService.markRead(conversation.id).subscribe(() => {
          const now = new Date().toISOString();
          this.teamsService.conversations.update(convs => convs.map(c => {
            if (c.id !== conversation.id) return c;
            return {
              ...c,
              members: c.members.map(m =>
                m.id === this.currentUserId() ? { ...m, lastReadAt: now } : m
              )
            };
          }));
        });
      },
      error: () => this.isLoadingMessages.set(false)
    });
  }

  startDirect(user: TeamUser): void {
    this.teamsService.createDirect(user.id).subscribe(conversation => {
      this.upsertConversation(conversation);
      this.selectConversation(conversation);
    });
  }


  toggleMember(userId: string): void {
    this.selectedMemberIds.update(current => {
      const next = new Set(current);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
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

  sendMessage(): void {
    const conversationId = this.selectedConversationId();
    const body = this.messageBody().trim();
    const attachments = this.selectedAttachments();
    if (!conversationId || this.isSending() || (!body && attachments.length === 0)) return;

    const optimisticId = `pending-${crypto.randomUUID()}`;
    const optimisticMessage = this.buildOptimisticMessage(optimisticId, conversationId, body, attachments);
    this.messages.update(messages => [...messages, optimisticMessage]);
    this.queueScroll();

    this.messageBody.set('');
    this.selectedAttachments.set([]);
    this.isSending.set(true);
    this.teamsService.sendTyping(conversationId, false);

    this.teamsService.sendMessage(conversationId, body, attachments.map(attachment => attachment.file)).subscribe({
      next: saved => {
        attachments.forEach(attachment => this.revokePreview(attachment));
        this.isSending.set(false);
        this.replaceOptimisticMessage(optimisticId, saved);
        this.receiveMessage(saved);
      },
      error: () => {
        this.isSending.set(false);
        this.messages.update(messages => messages.map(message => message.id === optimisticId ? { ...message, pending: false, failed: true } : message));
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

  applyFormat(format: 'bold' | 'italic' | 'inlineCode' | 'codeBlock' | 'quote'): void {
    const textarea = this.messageInput?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = this.messageBody();
    const selected = value.slice(start, end);
    const fallback = format === 'codeBlock' ? 'code goes here' : 'text';
    const content = selected || fallback;
    const wrapped = this.wrapSelection(format, content);

    this.messageBody.set(`${value.slice(0, start)}${wrapped}${value.slice(end)}`);
    queueMicrotask(() => {
      textarea.focus();
      textarea.selectionStart = start + wrapped.length;
      textarea.selectionEnd = start + wrapped.length;
    });
  }

  startCall(callType: 'voice' | 'video'): void {
    const conversationId = this.selectedConversationId();
    if (!conversationId) return;
    const callId = crypto.randomUUID();
    this.activeCall.set({ callId, callType, conversationId, status: `${callType === 'video' ? 'Video' : 'Voice'} call ringing` });
    this.teamsService.sendCallSignal({ conversationId, callId, callType, signalType: 'incoming' });
  }

  answerCall(accepted: boolean): void {
    const call = this.activeCall();
    if (!call) return;
    const signal: TeamCallSignal = { conversationId: call.conversationId, callId: call.callId, callType: call.callType, signalType: accepted ? 'accepted' : 'declined' };
    this.teamsService.sendCallSignal(signal);
    this.activeCall.set(accepted ? { ...call, status: 'Connected. Signaling is ready for media wiring.' } : null);
  }

  endCall(): void {
    const call = this.activeCall();
    if (!call) return;
    this.teamsService.sendCallSignal({ conversationId: call.conversationId, callId: call.callId, callType: call.callType, signalType: 'ended' });
    this.activeCall.set(null);
  }

  // ── Display helpers ──────────────────────────────────────────────────────

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
    if (!message) return conversation.isGroup ? 'Group conversation' : 'Direct conversation';
    if (message.body?.trim()) return message.body;
    const count = message.attachments?.length ?? 0;
    return count === 1 ? 'Sent an attachment' : `Sent ${count} attachments`;
  }

  getMessageSegments(body: string): MessageSegment[] {
    const parts = body.split(/```/g);
    return parts.map((content, index) => ({ type: index % 2 === 0 ? 'text' : 'code', content }))
      .filter(segment => segment.content.length > 0) as MessageSegment[];
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

  // ── Online / Offline ─────────────────────────────────────────────────────

  /**
   * Returns true if the OTHER member in a direct conversation is online.
   * Uses the live onlineUserIds set from SignalR UserPresenceChanged events.
   */
  isUserOnline(conversation: TeamConversation): boolean {
    if (conversation.isGroup) return false;
    const other = this.getOtherMember(conversation);
    console.log('[isUserOnline] other:', other?.id, 'onlineSet:', [...this.onlineUserIds()]);
    return other ? this.onlineUserIds().has(other.id) : false;
  }

  /** Returns the other participant in a direct conversation. */
  getOtherMember(conversation: TeamConversation): TeamConversationMember | undefined {
    return conversation.members.find(m => m.id !== this.currentUserId());
  }

  // ── Unread / Read status ─────────────────────────────────────────────────

  /**
   * A conversation has unread messages if:
   *   - there is a lastMessage
   *   - the current user's lastReadAt is null OR earlier than lastMessage.sentAt
   * This is derived purely from members[].lastReadAt — no unreadCount field needed.
   */
  hasUnread(conversation: TeamConversation): boolean {
    const lastMsg = conversation.lastMessage;
    if (!lastMsg) return false;
    // Don't show unread for currently open conversation
    if (conversation.id === this.selectedConversationId()) return false;
    const me = conversation.members.find(m => m.id === this.currentUserId());
    if (!me) return false;
    if (!me.lastReadAt) return true; // never read
    return new Date(lastMsg.sentAt) > new Date(me.lastReadAt);
  }

  /**
   * "Seen" tick for MY outgoing messages.
   * A message is seen if at least one OTHER member has a lastReadAt
   * that is >= the message's sentAt.
   */
  isMessageSeen(message: TeamMessage): boolean {
    if (message.pending || message.failed) return false;
    const conversation = this.conversations().find(c => c.id === message.conversationId);
    if (!conversation) return false;
    const others = conversation.members.filter(m => m.id !== this.currentUserId());
    return others.some(m => m.lastReadAt && new Date(m.lastReadAt) >= new Date(message.sentAt));
  }

  /**
   * Returns the last message I sent in the current conversation,
   * used to show a single seen/sent tick at the bottom.
   */
  getLastMyMessage(): TeamMessage | null {
    const myId = this.currentUserId();
    const msgs = this.messages();
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].senderId === myId && !msgs[i].pending && !msgs[i].failed) return msgs[i];
    }
    return null;
  }

  // ── Track functions ──────────────────────────────────────────────────────

  trackByConversation = (_: number, conversation: TeamConversation) => conversation.id;
  trackByUser = (_: number, user: TeamUser) => user.id;
  trackByMessage = (_: number, message: TeamMessage) => message.id;
  trackByAttachment = (_: number, attachment: TeamMessageAttachment | PendingAttachment) => attachment.id;
  trackBySegment = (index: number) => index;

  // ── Private ──────────────────────────────────────────────────────────────

  private receiveMessage(message: TeamMessage): void {
    if (message.conversationId === this.selectedConversationId()) {
      this.messages.update(messages => {
        const withoutPending = messages.filter(existing =>
          !existing.id.startsWith('pending-') || existing.body !== message.body
        );
        return withoutPending.some(m => m.id === message.id) ? withoutPending : [...withoutPending, message];
      });
      this.queueScroll();

      // Auto mark-read because the conversation is open
      this.teamsService.markRead(message.conversationId).subscribe(() => {
        const now = new Date().toISOString();
        this.teamsService.conversations.update(convs => convs.map(c => {
          if (c.id !== message.conversationId) return c;
          return {
            ...c,
            members: c.members.map(m =>
              m.id === this.currentUserId() ? { ...m, lastReadAt: now } : m
            )
          };
        }));
      });
    }

    this.teamsService.conversations.update(conversations => conversations.map(c =>
      c.id === message.conversationId
        ? { ...c, lastMessage: message, lastMessageAt: message.sentAt }
        : c
    ).sort((a, b) =>
      new Date(b.lastMessageAt ?? b.createdAt).getTime() - new Date(a.lastMessageAt ?? a.createdAt).getTime()
    ));
  }

  private upsertConversation(conversation: TeamConversation): void {
    this.teamsService.conversations.update(conversations => {
      const exists = conversations.some(c => c.id === conversation.id);
      const next = exists
        ? conversations.map(c => c.id === conversation.id ? conversation : c)
        : [conversation, ...conversations];
      return next.sort((a, b) =>
        new Date(b.lastMessageAt ?? b.createdAt).getTime() - new Date(a.lastMessageAt ?? a.createdAt).getTime()
      );
    });
  }

  private buildOptimisticMessage(id: string, conversationId: string, body: string, attachments: PendingAttachment[]): TeamMessage {
    return {
      id,
      conversationId,
      senderId: this.currentUserId() ?? '',
      senderName: this.currentUserName(),
      body,
      sentAt: new Date().toISOString(),
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
    this.queueScroll();
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

  private wrapSelection(format: 'bold' | 'italic' | 'inlineCode' | 'codeBlock' | 'quote', selected: string): string {
    switch (format) {
      case 'bold': return `**${selected}**`;
      case 'italic': return `_${selected}_`;
      case 'inlineCode': return `\`${selected}\``;
      case 'codeBlock': return `\n\n\`\`\`\n${selected}\n\`\`\`\n`;
      case 'quote': return selected.split('\n').map(line => `> ${line}`).join('\n');
    }
  }

  private queueScroll(): void {
    this.shouldScrollToBottom = true;
  }

  private scrollToBottom(): void {
    const element = this.messagesScroller?.nativeElement;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
  }
}