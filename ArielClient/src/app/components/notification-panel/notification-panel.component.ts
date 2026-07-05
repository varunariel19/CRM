import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNotification, NotificationState } from '../../state/notification.state';
import { GlobalState } from '../../state/global.state';
import { MenuState } from '../../state/menu.state';
import { MenuItemState } from '../../core/constants/menuItems';
import { NotificationService } from '../../core/services/notification.service';

const SWIPE_DISMISS_THRESHOLD = 90;

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.css'],
})
export class NotificationPanelComponent {
  globalState = inject(GlobalState);
  notificationState = inject(NotificationState);
  menuState = inject(MenuState);
  private notificationService = inject(NotificationService);

  private dragOffsets = signal<Record<string, number>>({});
  private readonly LOCKED_RESISTANCE = 24;
  draggingId: string | null = null;
  private dragStartX = 0;
  private didDrag = false;

  clearingIds = signal<Set<string>>(new Set());

  close(): void {
    this.globalState.close();
  }

  closeOnOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('np-overlay')) {
      this.close();
    }
  }

  hasReadNotifications(): boolean {
    return this.notificationState.notifications().some(n => n.isRead);
  }



  onNotificationClick(n: AppNotification): void {
    if (this.didDrag) {
      this.didDrag = false;
      return;
    }

    if (!n.isRead) {
      // optimistic local update
      this.notificationState.markRead(n.id);
      this.notificationService.markAsRead(n.id).subscribe({
        error: (err) => console.error('Failed to mark notification as read', err),
      });
    }

    if (n.link) {
      const route = n.link;
      const index = MenuItemState[route as keyof typeof MenuItemState];
      this.menuState.setActiveMenu(index);
      this.close();
    }
  }

  markAllRead(): void {
    this.notificationState.markAllRead();
    this.notificationService.markAllAsRead().subscribe({
      error: (err) => console.error('Failed to mark all notifications as read', err),
    });
  }

  clearAll(): void {
    const readIds = this.notificationState.notifications()
      .filter(n => n.isRead)
      .map(n => n.id);

    if (readIds.length === 0) return;

    this.clearingIds.set(new Set(readIds));

    setTimeout(() => {
      this.notificationState.clear();
      this.clearingIds.set(new Set());
      this.dragOffsets.set({});
    }, 260 + readIds.length * 30);

    this.notificationService.clearRead().subscribe({
      error: (err) => console.error('Failed to clear read notifications', err),
    });
  }

  trackById(index: number, item: AppNotification): string {
    return item.id;
  }

  timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  iconFor(type: string | undefined): string {
    switch (type) {
      case 'Lead': return 'fa-user-plus';
      case 'Deal': return 'fa-handshake';
      case 'Ticket': return 'fa-life-ring';
      case 'Task': return 'fa-list-check';
      case 'Meeting': return 'fa-calendar-days';
      case 'Message': return 'fa-message';
      default: return 'fa-bell';
    }
  }

  // ── Swipe-to-dismiss (mouse + touch via Pointer Events) ──

  itemOffset(id: string): number {
    return this.dragOffsets()[id] ?? 0;
  }

  canDismiss(n: AppNotification): boolean {
    return n.isRead;
  }

  isDismissing(id: string): boolean {
    return this.itemOffset(id) > SWIPE_DISMISS_THRESHOLD;
  }

  onPointerDown(event: PointerEvent, n: AppNotification): void {
    this.draggingId = n.id;
    this.dragStartX = event.clientX;
    this.didDrag = false;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent, n: AppNotification): void {
    if (this.draggingId !== n.id) return;
    const delta = event.clientX - this.dragStartX;

    if (delta <= 0) {
      this.setOffset(n.id, 0);
      return;
    }

    if (!this.canDismiss(n)) {
      // rubber-band resistance — moves a little, then hard-caps, to signal "locked"
      const resisted = Math.min(delta * 0.3, this.LOCKED_RESISTANCE);
      this.setOffset(n.id, resisted);
      return;
    }

    this.didDrag = delta > 6;
    this.setOffset(n.id, delta);
  }

  onPointerUp(event: PointerEvent, n: AppNotification): void {
    if (this.draggingId !== n.id) return;
    this.draggingId = null;

    if (!this.canDismiss(n)) {
      this.setOffset(n.id, 0); // always snap back, never dismiss
      return;
    }

    const offset = this.itemOffset(n.id);
    if (offset > SWIPE_DISMISS_THRESHOLD) {
      this.setOffset(n.id, 400);
      setTimeout(() => {
        this.notificationState.remove(n.id);
        this.clearOffset(n.id);
      }, 180);

      this.notificationService.remove(n.id).subscribe({
        error: (err) => console.error('Failed to remove notification', err),
      });
    } else {
      this.setOffset(n.id, 0);
    }
  }

  private setOffset(id: string, value: number): void {
    this.dragOffsets.update(map => ({ ...map, [id]: value }));
  }

  private clearOffset(id: string): void {
    this.dragOffsets.update(map => {
      const { [id]: _, ...rest } = map;
      return rest;
    });
  }
}