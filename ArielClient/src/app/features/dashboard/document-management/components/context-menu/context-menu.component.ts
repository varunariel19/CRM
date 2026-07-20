import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-document-context-menu',
  standalone: true,
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss',
    '../../document-management.component.scss'
  ],
})
export class ContextMenuComponent {
  @Input({ required: true }) x = 0;
  @Input({ required: true }) y = 0;
  @Input() selectedCount = 1;
  @Input() isSystem = false;
  @Input() canPaste = false;

  @Output() open = new EventEmitter<void>();
  @Output() rename = new EventEmitter<void>();
  @Output() cut = new EventEmitter<void>();
  @Output() copy = new EventEmitter<void>();
  @Output() paste = new EventEmitter<void>();
  @Output() createShortcut = new EventEmitter<void>();
  @Output() copyPath = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() properties = new EventEmitter<void>();
  @Output() closeMenu = new EventEmitter<void>();

  constructor(private elRef: ElementRef<HTMLElement>) { }

  get isSingleSelection(): boolean {
    return this.selectedCount <= 1;
  }

  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target as Node)) {
      this.closeMenu.emit();
    }
  }

 
  @HostListener('document:contextmenu', ['$event'])
  onDocumentContextMenu(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target as Node)) {
      this.closeMenu.emit();
    }
  }

  
  @HostListener('document:scroll')
  onDocumentScroll() {
    this.closeMenu.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenu.emit();
  }
}