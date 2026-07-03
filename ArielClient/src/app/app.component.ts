import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
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

export class App {
  private teamsService = inject(TeamsService);

  private notificationState = inject(NotificationState);

  private unregister?: () => void;

  constructor(public authState: AuthState) {
    effect(() => {
      if (this.authState.isLoggedIn()) {
        this.teamsService.connect({
          onNotification: (notification) => this.notificationState.add(notification)
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


  get LogoUrl() {
    return this.authState.logoUrl();
  }
}
