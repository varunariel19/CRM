import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { endpoints, TeamsHubUrl } from '../core/constants/endpoints';
import { TeamConversation, TeamMessage, TeamUser } from '../core/types/teams.type';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private http = inject(HttpClient);
  private connection?: signalR.HubConnection;
  private messageHandlers: Array<(message: TeamMessage) => void> = [];
  private conversationHandlers: Array<(conversation: TeamConversation) => void> = [];
  private seenHandlers: Array<(conversationId: string, messageIds: string[], seenById: string) => void> = [];
  private handlersRegistered = false;

  readonly conversations = signal<TeamConversation[]>([]);
  readonly users = signal<TeamUser[]>([]);
  readonly onlineUserIds = signal<Set<string>>(new Set());
  readonly typing = signal<Record<string, string[]>>({});

  loadUsers() {
    return this.http.get<TeamUser[]>(endpoints.teams.users, { withCredentials: true });
  }

  loadConversations() {
    return this.http.get<TeamConversation[]>(endpoints.teams.conversations, { withCredentials: true });
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

  sendMessage(conversationId: string, body: string, attachments: File[] = []) {
    const formData = new FormData();
    formData.append('body', body);
    attachments.forEach(file => formData.append('attachments', file, file.name));
    return this.http.post<TeamMessage>(endpoints.teams.sendMessage(conversationId), formData, { withCredentials: true });
  }

  markRead(conversationId: string) {
    return this.http.post<void>(endpoints.teams.markRead(conversationId), {}, { withCredentials: true });
  }

  async connect(
    onMessage?: (message: TeamMessage) => void,
    onConversation?: (conversation: TeamConversation) => void,
    onSeen?: (conversationId: string, messageIds: string[], seenById: string) => void
  ): Promise<void> {
    if (onMessage) this.messageHandlers.push(onMessage);
    if (onConversation) this.conversationHandlers.push(onConversation);
    if (onSeen) this.seenHandlers.push(onSeen);

    if (!this.connection) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(TeamsHubUrl, { withCredentials: true })
        .withAutomaticReconnect()
        .build();
    }

    this.registerHandlers();

    if (this.connection.state === signalR.HubConnectionState.Connected || this.connection.state === signalR.HubConnectionState.Connecting) return;
    await this.connection.start();
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
  }
}
