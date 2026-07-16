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
  @Input() isOpen = false;
  @Input({ required: true }) title!: string;
  @Input() subtitle = 'This action cannot be undone.';
  @Input({ required: true }) confirmPhrase!: string;
  @Input() isProcessing = false;
  @Input() confirmButtonText = 'Delete';
  @Input() processingText = 'Deleting…';
  @Input() cancelButtonText = 'Cancel';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  protected readonly confirmText = signal('');

  protected readonly isConfirmed = computed(() => {
    const typed = this.confirmText().trim();
    return typed.length > 0 && typed === (this.confirmPhrase ?? '').trim();
  });

  ngOnChanges(changes: SimpleChanges): void {
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