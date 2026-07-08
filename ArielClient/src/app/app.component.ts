import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { AuthState } from './state/auth.state';
import { TeamsService } from './services/teams.service';
import { NotificationState } from './state/notification.state';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet],
  providers: [DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class App implements OnInit {
  private teamsService = inject(TeamsService);
  private notificationState = inject(NotificationState);
  private unregister?: () => void;

  constructor(public authState: AuthState) {
    effect(() => {
      if (this.authState.isLoggedIn()) {
        this.teamsService.connect({
          onNotification: (notification) => {
            if (notification.entityType == "Message" && !this.notificationState.showMessageNotification()) return;
            this.notificationState.add(notification);
            this.notificationState.show(notification);
            this.notificationState.showMainMessageNotification(notification.message, notification.title);
          },

        })
          .then(cleanup => { this.unregister = cleanup; })
          .catch(err => console.error('Teams presence connection failed', err));
      } else {
        this.unregister?.();
        this.unregister = undefined;
        this.teamsService.disconnect().catch(err => console.error('Teams presence disconnect failed', err));
      }
    });
  }
  ngOnInit(): void {
    this.requestNotificationPermission();
  }


  async requestNotificationPermission() {
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  }


  get LogoUrl() {
    return this.authState.logoUrl();
  }
}
