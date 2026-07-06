import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DeepLinkService {
  pendingLeadId = signal<string | null>(null);
  pendingProjectId = signal<string | null>(null);
  pendingTaskId = signal<string | null>(null);
  pendingConversationId = signal<string | null>(null);
}
