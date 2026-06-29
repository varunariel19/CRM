import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { AuthState } from './state/auth.state';
import { TeamsService } from './services/teams.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet],
  providers: [DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class App {
  private teamsService = inject(TeamsService);

  constructor(public authState: AuthState) {
    effect(() => {
      if (this.authState.isLoggedIn()) {
        this.teamsService.connect().catch(err => console.error('Teams presence connection failed', err));
      } else {
        this.teamsService.disconnect().catch(err => console.error('Teams presence disconnect failed', err));
      }
    });
  }


  get LogoUrl() {
     return this.authState.logoUrl();
  }
}
