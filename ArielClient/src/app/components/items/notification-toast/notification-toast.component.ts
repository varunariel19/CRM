import { Component, inject, ElementRef, viewChild, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationState, ToastItem } from '../../../state/notification.state';
import { MenuState } from '../../../state/menu.state';
import { MenuItemState } from '../../../core/constants/menuItems';

const AUTO_DISMISS_MS = 6000;

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.css'],
})
export class NotificationToastComponent {
  toastState = inject(NotificationState);
  private menuState = inject(MenuState);

  private timers = new Map<string, any>();


  constructor() {
    effect(() => {
      const current = this.toastState.toasts();
      current.forEach(t => this.scheduleAutoDismiss(t.toastId));
    });
  }

  get toasts(): ToastItem[] {
    return this.toastState.toasts();
  }

  scheduleAutoDismiss(toastId: string): void {
    if (this.timers.has(toastId)) return;
    const timer = setTimeout(() => this.dismiss(toastId), AUTO_DISMISS_MS);
    this.timers.set(toastId, timer);
  }

  pause(toastId: string): void {
    const timer = this.timers.get(toastId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(toastId);
    }
  }

  resume(toastId: string): void {
    this.scheduleAutoDismiss(toastId);
  }

  dismiss(toastId: string): void {
    this.timers.delete(toastId);
    this.toastState.dismiss(toastId);
  }

  onToastClick(toast: ToastItem): void {
    if (toast.link) {
      const index = MenuItemState[toast.link as keyof typeof MenuItemState];
      this.menuState.setActiveMenu(index);
    }
    this.dismiss(toast.toastId);
  }

  trackByToastId(index: number, item: ToastItem): string {
    return item.toastId;
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
}