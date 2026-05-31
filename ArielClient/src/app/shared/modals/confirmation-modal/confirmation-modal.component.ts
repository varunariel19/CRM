import { Component, inject  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuState } from '../../../state/menu.state';




@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css',
})
export class ConfirmationModalComponent  {

  confirmationState = inject(MenuState);
}