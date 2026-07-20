import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-folder-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-folder-dialog.component.html',
  styleUrls: ['./new-folder-dialog.component.scss'],
})
export class NewFolderDialogComponent implements AfterViewInit {
  @Input() defaultName = 'New folder';
  @Input() error: string | null = null;

  @Output() valueChange = new EventEmitter<string>();



  @Output() create = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('folderInput') folderInput!: ElementRef<HTMLInputElement>;

  value = signal('');

  ngOnInit(): void {
    this.value.set(this.defaultName);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.folderInput?.nativeElement.focus({ preventScroll: true });
      this.folderInput?.nativeElement.select();
    });
  }

  onInput(val: string) {
    this.value.set(val);
    this.valueChange.emit(val); 
  }
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.confirm();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancel.emit();
    }
  }

  confirm() {
    const name = this.value().trim();
    if (!name) return;
    this.create.emit(name);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.cancel.emit();
  }
}