import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { endpoints, TeamsHubUrl } from '../core/constants/endpoints';
import { TeamCallSignal, TeamConversation, TeamMessage, TeamUser } from '../core/types/teams.type';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private http = inject(HttpClient);
  private connection?: signalR.HubConnection;

  readonly conversations = signal<TeamConversation[]>([]);
  readonly users = signal<TeamUser[]>([]);
  readonly onlineUserIds = signal<Set<string>>(new Set());
  readonly typing = signal<Record<string, string[]>>({});
  readonly incomingCall = signal<(TeamCallSignal & { fromUserId: string; fromName: string }) | null>(null);

  loadUsers() {
    return this.http.get<TeamUser[]>(endpoints.teams.users, { withCredentials: true });
  }

  loadConversations() {
    return this.http.get<TeamConversation[]>(endpoints.teams.conversations, { withCredentials: true });
  }

  loadMessages(conversationId: string) {
    return this.http.get<TeamMessage[]>(endpoints.teams.messages(conversationId), { withCredentials: true });
  }

  createDirect(userId: string) {
    return this.http.post<TeamConversation>(endpoints.teams.direct, { userId }, { withCredentials: true });
  }

  createGroup(name: string, memberIds: string[]) {
    return this.http.post<TeamConversation>(endpoints.teams.groups, { name, memberIds }, { withCredentials: true });
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

  async connect(onMessage: (message: TeamMessage) => void, onConversation: (conversation: TeamConversation) => void): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(TeamsHubUrl, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.connection.on('MessageReceived', onMessage);
    this.connection.on('ConversationChanged', onConversation);

    this.connection.on('OnlineUsersSnapshot', (userIds: string[]) => {
      console.log('[OnlineUsersSnapshot received]', userIds);
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
    this.connection.on('CallSignalReceived', (conversationId: string, fromUserId: string, fromName: string, callId: string, callType: 'voice' | 'video', signalType: TeamCallSignal['signalType'], payload?: string | null) => {
      this.incomingCall.set({ conversationId, fromUserId, fromName, callId, callType, signalType, payload });
    });

    await this.connection.start();
  }

  async joinConversation(conversationId: string): Promise<void> {
    await this.connection?.invoke('JoinConversation', conversationId);
  }

  async sendTyping(conversationId: string, isTyping: boolean): Promise<void> {
    await this.connection?.invoke('SendTyping', conversationId, isTyping);
  }

  async sendCallSignal(signal: TeamCallSignal): Promise<void> {
    await this.connection?.invoke('SendCallSignal', signal);
  }
}
