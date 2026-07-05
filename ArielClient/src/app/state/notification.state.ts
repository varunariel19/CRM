import { Injectable, signal } from '@angular/core';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  entityType?: string;   // 'Lead' | 'Deal' | 'Ticket' | 'Task' | 'Meeting' | 'Message'
  entityId?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const DUMMY_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    userId: 'user-123',
    title: 'New lead assigned',
    message: '"Michael Chen" from NorthGate Logistics was assigned to you',
    entityType: 'Lead',
    entityId: 'lead-001',
    link: 'leads',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
  },

  {
    id: '2',
    userId: 'user-123',
    title: 'Ticket escalated',
    message: 'Ticket #4821 "Login failing on mobile app" was marked High priority',
    entityType: 'Ticket',
    entityId: 'ticket-4821',
    link: 'tickets',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
  },
  {
    id: '3',
    userId: 'user-123',
    title: 'Task due soon',
    message: '"Send proposal to Acme Corp" is due in 1 hour',
    entityType: 'Task',
    entityId: 'task-118',
    link: 'tasks',
    isRead: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
  },
  {
    id: '4',
    userId: 'user-123',
    title: 'Meeting starting soon',
    message: '"Weekly Sales Sync" starts in 15 minutes',
    entityType: 'Meeting',
    entityId: 'meeting-077',
    link: 'appointments',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min ago
  },
  {
    id: '5',
    userId: 'user-123',
    title: 'New message',
    message: 'Sarah Williams: "Can you review the contract draft I sent?"',
    entityType: 'Message',
    entityId: 'conv-009',
    link: 'teams',
    isRead: false,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
];

export interface ToastItem extends AppNotification {
  toastId: string; // unique per toast instance, so the same notification could theoretically show twice
}

@Injectable({ providedIn: 'root' })
export class NotificationState {
  readonly notifications = signal<AppNotification[]>([]);
  showMessageNotification = signal(true);
  readonly unreadCount = signal<number>(0);
  readonly toasts = signal<ToastItem[]>([]);

  private notificationAudio = new Audio('/sounds/ariel-notification.mp3');
  private messageAudio = new Audio('/sounds/message-sound.mp3');



  setAll(list: AppNotification[]): void {
    this.notifications.set(list);
    this.unreadCount.set(list.filter(n => !n.isRead).length);
  }

  add(n: AppNotification): void {
    this.notifications.update(list => [n, ...list]);
    if (!n.isRead) this.unreadCount.update(c => c + 1);
  }

  markRead(id: string): void {
    let wasUnread = false;
    this.notifications.update(list =>
      list.map(n => {
        if (n.id === id && !n.isRead) wasUnread = true;
        return n.id === id ? { ...n, isRead: true } : n;
      })
    );
    if (wasUnread) this.unreadCount.update(c => Math.max(0, c - 1));
  }

  markAllRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
    this.unreadCount.set(0);
  }


  remove(id: string): void {
    const target = this.notifications().find(n => n.id === id);
    if (target && !target.isRead) return;
    this.notifications.update(list => list.filter(n => n.id !== id));
  }

  clear(): void {
    this.notifications.update(list => list.filter(n => !n.isRead));
  }

  show(notification: AppNotification): void {
    const toast: ToastItem = {
      ...notification,
      toastId: `${notification.id}-${Date.now()}`,
    };
    this.toasts.update(list => [...list, toast]);
    this.playNotificationSound();
  }

  playNotificationSound(): void {
    this.notificationAudio.currentTime = 0;
    this.notificationAudio.play().catch((err) => {
      console.log("audio error", err);
    });
  }

  playMessageReceivedSound() {
    this.messageAudio.currentTime = 0;
    this.messageAudio.play().catch((err) => {
      console.log("audio error", err);
    });
  }

  dismiss(toastId: string): void {
    this.toasts.update(list => list.filter(t => t.toastId !== toastId));
  }


  showMainMessageNotification(senderName: string, messageText: string) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(`New message from ${senderName}`, {
        body: "You have new notification !! ",
        icon: '/notification.png',
        tag: 'new-message' 
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }

  }
}