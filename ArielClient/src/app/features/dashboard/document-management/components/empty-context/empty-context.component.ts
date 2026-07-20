import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type SortField = 'name' | 'type' | 'dateModified' | 'size';
export type ViewMode = 'grid-large' | 'grid-medium' | 'grid-small' | 'list' | 'details';

@Component({
  selector: 'app-document-empty-context-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-context.component.html',
  styleUrls: ['./empty-context.component.scss'],
})
export class DocumentEmptyContextMenuComponent {
  @Input() x = 0;
  @Input() y = 0;
  @Input() canPaste = false;
  @Input() canCreate = true;
  @Input() currentView: ViewMode = 'grid-medium';
  @Input() currentSort: SortField = 'name';

  @Output() refresh = new EventEmitter<void>();
  @Output() paste = new EventEmitter<void>();
  @Output() newFolder = new EventEmitter<void>();
  @Output() uploadFile = new EventEmitter<void>();
  @Output() viewChange = new EventEmitter<ViewMode>();
  @Output() sortChange = new EventEmitter<SortField>();
  @Output() closeMenu = new EventEmitter<void>();

  activeSubmenu = signal<'view' | 'sort' | 'new' | null>(null);

  viewOptions: { value: ViewMode; label: string }[] = [
    { value: 'grid-large', label: 'Large icons' },
    { value: 'grid-medium', label: 'Medium icons' },
    { value: 'grid-small', label: 'Small icons' },
    { value: 'list', label: 'List' },
    { value: 'details', label: 'Details' },
  ];

  sortOptions: { value: SortField; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'type', label: 'Type' },
    { value: 'dateModified', label: 'Date modified' },
    { value: 'size', label: 'Size' },
  ];

  constructor(private elRef: ElementRef<HTMLElement>) {}

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target as Node)) {
      this.closeMenu.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenu.emit();
  }

  toggleSubmenu(name: 'view' | 'sort' | 'new', event: MouseEvent) {
    event.stopPropagation();
    this.activeSubmenu.set(this.activeSubmenu() === name ? null : name);
  }

  onRefresh() {
    this.refresh.emit();
    this.closeMenu.emit();
  }

  onPaste() {
    if (!this.canPaste) return;
    this.paste.emit();
    this.closeMenu.emit();
  }

  onNewFolder() {
    this.newFolder.emit();
    this.closeMenu.emit();
  }

  onUploadFile() {
    this.uploadFile.emit();
    this.closeMenu.emit();
  }

  onViewSelect(view: ViewMode) {
    this.viewChange.emit(view);
    this.closeMenu.emit();
  }

  onSortSelect(sort: SortField) {
    this.sortChange.emit(sort);
    this.closeMenu.emit();
  }
}