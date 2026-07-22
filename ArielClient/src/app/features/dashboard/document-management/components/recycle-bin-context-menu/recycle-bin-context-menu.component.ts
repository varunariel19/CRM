import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-recycle-bin-context-menu',
  standalone: true,
  templateUrl: './recycle-bin-context-menu.component.html',
  styleUrls: ['./recycle-bin-context-menu.component.css' , '../../document-management.component.scss'],
})

export class RecycleBinContextMenuComponent {
  @Input({ required: true }) x = 0;
  @Input({ required: true }) y = 0;
  /** true when right-clicked on an item inside the bin, false when right-clicked on empty space */
  @Input() hasSelection = false;

  @Output() open = new EventEmitter<void>();
  @Output() emptyRecycleBin = new EventEmitter<void>();
  @Output() properties = new EventEmitter<void>();
  @Output() closeMenu = new EventEmitter<void>();

  constructor(private elRef: ElementRef<HTMLElement>) {}


  

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