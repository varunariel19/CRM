import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { endpoints, TeamsHubUrl } from '../core/constants/endpoints';
import { TeamConversation, TeamMessage, TeamUser } from '../core/types/teams.type';
import { Observable } from 'rxjs';
import { ScheduledTeamMessage } from '../features/dashboard/teams/teams.component';
import { AppNotification } from '../state/notification.state';

export interface TeamsConnectHandlers {
  onMessage?: (message: TeamMessage) => void;
  onConversation?: (conversation: TeamConversation) => void;
  onSeen?: (conversationId: string, messageIds: string[], seenById: string) => void;
  onMessageEdited?: (message: TeamMessage) => void;
  onMessageDeleted?: (message: TeamMessage) => void;
  onMessageRestored?: (message: TeamMessage) => void;
  onScheduledDelivered?: (conversationId: string, scheduledMessageId: string) => void;
  onLeadStatusChanged?: (leadId: string, status: string) => void;
  onLeadConverted?: (leadId: string, status: string) => void;
  onNotification?: (notification: AppNotification) => void;
}

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private http = inject(HttpClient);
  private connection?: signalR.HubConnection;
  private handlersRegistered = false;

  readonly conversations = signal<TeamConversation[]>([]);
  readonly users = signal<TeamUser[]>([]);
  readonly onlineUserIds = signal<Set<string>>(new Set());
  readonly typing = signal<Record<string, string[]>>({});

  private messageHandlers: Array<(message: TeamMessage) => void> = [];
  private conversationHandlers: Array<(conversation: TeamConversation) => void> = [];
  private seenHandlers: Array<(conversationId: string, messageIds: string[], seenById: string) => void> = [];
  private messageEditedHandlers: Array<(message: TeamMessage) => void> = [];
  private messageDeletedHandlers: Array<(message: TeamMessage) => void> = [];
  private messageRestoredHandlers: Array<(message: TeamMessage) => void> = [];
  private scheduledDeliveredHandlers: Array<(conversationId: string, scheduledMessageId: string) => void> = [];
  private leadStatusChangedHandlers: Array<(leadId: string, status: string) => void> = [];
  private leadConvertedHandlers: Array<(leadId: string, status: string) => void> = [];
  private notificationHandlers: Array<(notification: AppNotification) => void> = [];

  loadUsers() {
    return this.http.get<TeamUser[]>(endpoints.teams.users, { withCredentials: true });
  }

  loadConversations() {
    return this.http.get<TeamConversation[]>(endpoints.teams.conversations, { withCredentials: true });
  }

  loadScheduledMessages(conversationId: string) {
    return this.http.get<ScheduledTeamMessage[]>(
      endpoints.teams.scheduledMessages(conversationId),
      { withCredentials: true }
    );
  }

  cancelScheduledMessage(conversationId: string, messageId: string) {
    return this.http.delete<void>(
      endpoints.teams.cancelScheduledMessage(conversationId, messageId),
      { withCredentials: true }
    );
  }

  loadMessages(conversationId: string, before?: string, take = 40) {
    const params: Record<string, string> = { take: take.toString() };
    if (before) params['before'] = before;
    return this.http.get<TeamMessage[]>(endpoints.teams.messages(conversationId), {
      params,
      withCredentials: true
    });
  }

  createDirect(userId: string, content: string, files: File[] = []): Observable<TeamConversation> {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('firstMessage', content);
    files.forEach(file => formData.append('attachments', file));
    return this.http.post<TeamConversation>(endpoints.teams.direct, formData, { withCredentials: true });
  }

  createGroup(name: string, memberIds: string[]) {
    return this.http.post<TeamConversation>(endpoints.teams.groups, { name, memberIds }, { withCredentials: true });
  }

  addGroupMembers(conversationId: string, memberIds: string[]) {
    return this.http.post<TeamConversation>(endpoints.teams.addMembers(conversationId), { memberIds }, { withCredentials: true });
  }

  sendMessage(conversationId: string, body: string, attachments: File[] = [], scheduledAt?: string) {
    const formData = new FormData();
    formData.append('body', body);
    attachments.forEach(file => formData.append('attachments', file, file.name));
    if (scheduledAt) formData.append('scheduledAt', scheduledAt);
    return this.http.post<TeamMessage | ScheduledTeamMessage>(
      endpoints.teams.sendMessage(conversationId),
      formData,
      { withCredentials: true, observe: 'response' }
    );
  }

  markRead(conversationId: string) {
    return this.http.post<void>(endpoints.teams.markRead(conversationId), {}, { withCredentials: true });
  }

  restoreMessage(conversationId: string, messageId: string) {
    return this.http.post<TeamMessage>(endpoints.teams.restoreMessage(conversationId, messageId), {}, { withCredentials: true });
  }

  async connect(handlers: TeamsConnectHandlers = {}): Promise<() => void> {
  const {
    onMessage, onConversation, onSeen, onMessageEdited,
    onMessageDeleted, onMessageRestored, onScheduledDelivered,
    onLeadStatusChanged, onLeadConverted, onNotification // 🆕
  } = handlers;

  if (onMessage) this.messageHandlers.push(onMessage);
  if (onConversation) this.conversationHandlers.push(onConversation);
  if (onSeen) this.seenHandlers.push(onSeen);
  if (onMessageEdited) this.messageEditedHandlers.push(onMessageEdited);
  if (onMessageDeleted) this.messageDeletedHandlers.push(onMessageDeleted);
  if (onMessageRestored) this.messageRestoredHandlers.push(onMessageRestored);
  if (onScheduledDelivered) this.scheduledDeliveredHandlers.push(onScheduledDelivered);
  if (onLeadStatusChanged) this.leadStatusChangedHandlers.push(onLeadStatusChanged);
  if (onLeadConverted) this.leadConvertedHandlers.push(onLeadConverted);
  if (onNotification) this.notificationHandlers.push(onNotification); // 🆕

  if (!this.connection) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(TeamsHubUrl, { withCredentials: true })
      .withAutomaticReconnect()
      .build();
  }

  this.registerHandlers();

  if (this.connection.state !== signalR.HubConnectionState.Connected
    && this.connection.state !== signalR.HubConnectionState.Connecting) {
    await this.connection.start();
  }

  return () => {
    if (onMessage) this.messageHandlers = this.messageHandlers.filter(h => h !== onMessage);
    if (onConversation) this.conversationHandlers = this.conversationHandlers.filter(h => h !== onConversation);
    if (onSeen) this.seenHandlers = this.seenHandlers.filter(h => h !== onSeen);
    if (onMessageEdited) this.messageEditedHandlers = this.messageEditedHandlers.filter(h => h !== onMessageEdited);
    if (onMessageDeleted) this.messageDeletedHandlers = this.messageDeletedHandlers.filter(h => h !== onMessageDeleted);
    if (onMessageRestored) this.messageRestoredHandlers = this.messageRestoredHandlers.filter(h => h !== onMessageRestored);
    if (onScheduledDelivered) this.scheduledDeliveredHandlers = this.scheduledDeliveredHandlers.filter(h => h !== onScheduledDelivered);
    if (onLeadStatusChanged) this.leadStatusChangedHandlers = this.leadStatusChangedHandlers.filter(h => h !== onLeadStatusChanged);
    if (onLeadConverted) this.leadConvertedHandlers = this.leadConvertedHandlers.filter(h => h !== onLeadConverted);
    if (onNotification) this.notificationHandlers = this.notificationHandlers.filter(h => h !== onNotification); // 🆕
  };
}

  async disconnect(): Promise<void> {
    if (!this.connection || this.connection.state === signalR.HubConnectionState.Disconnected) return;
    await this.connection.stop();
    this.onlineUserIds.set(new Set());
  }

  async joinConversation(conversationId: string): Promise<void> {
    await this.connection?.invoke('JoinConversation', conversationId);
  }

  async sendTyping(conversationId: string, isTyping: boolean): Promise<void> {
    await this.connection?.invoke('SendTyping', conversationId, isTyping);
  }

  editMessage(conversationId: string, messageId: string, content: string) {
    return this.http.put<TeamMessage>(endpoints.teams.editMessage(conversationId, messageId), { content }, { withCredentials: true });
  }

  deleteMessage(conversationId: string, messageId: string) {
    return this.http.delete<void>(endpoints.teams.deleteMessage(conversationId, messageId), { withCredentials: true });
  }

private registerHandlers(): void {
  if (!this.connection || this.handlersRegistered) return;
  this.handlersRegistered = true;

  this.connection.on('MessageReceived', (message: TeamMessage) => {
    this.messageHandlers.forEach(handler => handler(message));
  });

  this.connection.on('ConversationChanged', (conversation: TeamConversation) => {
    this.conversationHandlers.forEach(handler => handler(conversation));
  });

  this.connection.on('MessagesSeen', (conversationId: string, messageIds: string[], seenById: string) => {
    this.seenHandlers.forEach(handler => handler(conversationId, messageIds, seenById));
  });

  this.connection.on('OnlineUsersSnapshot', (userIds: string[]) => {
    this.onlineUserIds.set(new Set(userIds));
  });

  this.connection.on('UserPresenceChanged', (userId: string, online: boolean) => {
    this.onlineUserIds.update(current => {
      const next = new Set(current);
      online ? next.add(userId) : next.delete(userId);
      return next;
    });
  });

  this.connection.on('TypingChanged', (conversationId: string, userId: string, name: string, isTyping: boolean) => {
    this.typing.update(current => {
      const names = new Set(current[conversationId] ?? []);
      isTyping ? names.add(name) : names.delete(name);
      return { ...current, [conversationId]: [...names] };
    });
  });

  this.connection.on('MessageEdited', (message: TeamMessage) => {
    this.messageEditedHandlers.forEach(handler => handler(message));
  });

  this.connection.on('MessageDeleted', (message: TeamMessage) => {
    this.messageDeletedHandlers.forEach(handler => handler(message));
  });

  this.connection.on('MessageRestored', (message: TeamMessage) => {
    this.messageRestoredHandlers.forEach(handler => handler(message));
  });

  this.connection.on('ScheduledMessageDelivered', (conversationId: string, scheduledMessageId: string) => {
    this.scheduledDeliveredHandlers.forEach(handler => handler(conversationId, scheduledMessageId));
  });

  this.connection.on('LeadStatusChanged', (leadId: string, status: string) => {
    this.leadStatusChangedHandlers.forEach(handler => handler(leadId, status));
  });

  this.connection.on('LeadConverted', (leadId: string, status: string) => {
    this.leadConvertedHandlers.forEach(handler => handler(leadId, status));
  });

  this.connection.on('NotificationReceived', (notification: AppNotification) => {
    this.notificationHandlers.forEach(handler => handler(notification));
  });
}
}