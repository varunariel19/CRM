import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rename-popover',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rename-popover.component.html',
  styleUrls: ['./rename-popover.component.scss' , '../../document-management.component.scss'],
})
export class RenamePopoverComponent implements AfterViewInit {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value = '';
  @Input({ required: true }) x = 0;
  @Input({ required: true }) y = 0;

  @Output() valueChange = new EventEmitter<string>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('renameInput') renameInput!: ElementRef<HTMLInputElement>;

ngAfterViewInit(): void {
  setTimeout(() => {
    this.renameInput?.nativeElement.focus({ preventScroll: true });
    this.renameInput?.nativeElement.select();
  });
}

  onInput(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.confirm.emit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancel.emit();
    }
  }
}