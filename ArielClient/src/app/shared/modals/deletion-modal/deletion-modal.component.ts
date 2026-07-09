import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-deletion-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deletion-modal.component.html',
  styleUrls: ['./deletion-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeletionModalComponent implements OnChanges {
  /** Whether the modal is visible */
  @Input() isOpen = false;

  /** Heading, e.g. "Remove John Doe?" */
  @Input({ required: true }) title!: string;

  /** Description text under the heading */
  @Input() subtitle = 'This action cannot be undone.';

  /** Exact phrase the user must type to enable the confirm button */
  @Input({ required: true }) confirmPhrase!: string;

  /** Whether an async delete/remove operation is currently running */
  @Input() isProcessing = false;

  /** Confirm button label while idle */
  @Input() confirmButtonText = 'Delete';

  /** Confirm button label while isProcessing = true */
  @Input() processingText = 'Deleting…';

  /** Cancel button label */
  @Input() cancelButtonText = 'Cancel';

  /** Emits when the user confirms (button enabled + clicked) */
  @Output() confirmed = new EventEmitter<void>();

  /** Emits when the user cancels (backdrop click or Cancel button) */
  @Output() cancelled = new EventEmitter<void>();

  protected readonly confirmText = signal('');

  protected readonly isConfirmed = computed(() => {
    const typed = this.confirmText().trim();
    return typed.length > 0 && typed === (this.confirmPhrase ?? '').trim();
  });

  ngOnChanges(changes: SimpleChanges): void {
    // Reset whatever was typed each time the modal is (re)opened
    if (changes['isOpen'] && this.isOpen) {
      this.confirmText.set('');
    }
  }

  onConfirmInput(value: string): void {
    this.confirmText.set(value);
  }

  onCancel(): void {
    if (this.isProcessing) return;
    this.cancelled.emit();
  }

  onConfirm(): void {
    if (!this.isConfirmed() || this.isProcessing) return;
    this.confirmed.emit();
  }
}