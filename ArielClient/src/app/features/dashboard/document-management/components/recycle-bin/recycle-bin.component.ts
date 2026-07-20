import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { getVSIFileIcon } from '@baybreezy/file-extension-icon';

import { BinContextMenuState, BinContextMenuTarget, FileProps, FolderProps } from '../../types/document-management.type';
import { DocumentManagementService } from '../../../../../services/document-mangement.service';
import { DocumentFilePayload, FolderPayload, FolderState } from '../../../../../state/document-mangement.state';
import { entryKey, getFileTypeLabel } from '../../services/document-management.util';
import { PropertiesDialogComponent } from '../properties-dialog/properties-dialog.component';

interface MarqueeRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-recycle-bin',
  standalone: true,
  imports: [CommonModule, PropertiesDialogComponent],
  templateUrl: './recycle-bin.component.html',
  styleUrls: ['./recycle-bin.component.scss', '../../document-management.component.scss'],
})
export class RecycleBinComponent implements OnChanges {
  @Output() exit = new EventEmitter<void>();

  @Input() marqueeBox: MarqueeRect | null = null;

  deletedFolders = computed(() => this.folderState.binFolders());
  deletedFiles = computed(() => this.folderState.binFiles());

  private selectedKeys = signal<Set<string>>(new Set());
  selectedCount = computed(() => this.selectedKeys().size);

  private marqueeBaseSelection: Set<string> = new Set();
  private isMarqueeActive = false;

  contextMenu: BinContextMenuState | null = null;
  private contextMenuTargets: BinContextMenuTarget[] = [];

  propertiesFolder: FolderProps | null = null;
  propertiesFile: FileProps | null = null;
  propertiesFavorite = signal(false);

  constructor(
    private folderService: DocumentManagementService,
    private folderState: FolderState,
    private elRef: ElementRef<HTMLElement>,
  ) { }

  @HostListener('document:click')
  @HostListener('document:contextmenu')
  onDocumentInteraction(): void {
    this.closeContextMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeContextMenu();
    this.closeProperties();
    this.selectedKeys.set(new Set());
  }

  // --- marquee-driven selection ---

ngOnChanges(changes: SimpleChanges): void {
  if (!changes['marqueeBox']) return;

  const box = this.marqueeBox;

  if (box) {
    const isRealDrag = box.width > 3 || box.height > 3; // ignore near-zero boxes (a click, not a drag)

    if (!isRealDrag) return; // don't touch selection/context menu for a mere mousedown

    if (!this.isMarqueeActive) {
      this.isMarqueeActive = true;
      this.marqueeBaseSelection = new Set(this.selectedKeys());
      this.closeContextMenu();
    }
    this.applyMarqueeSelection(box);
  } else {
    this.isMarqueeActive = false;
  }
}
  private applyMarqueeSelection(box: MarqueeRect): void {
    const containerRect = this.elRef.nativeElement.getBoundingClientRect();

    const marqueeRect = {
      left: box.left,
      top: box.top,
      right: box.left + box.width,
      bottom: box.top + box.height,
    };

    const cards = this.elRef.nativeElement.querySelectorAll<HTMLElement>('[data-key]');
    const intersecting = new Set<string>();

    cards.forEach(cardEl => {
      const r = cardEl.getBoundingClientRect();
      const cardRect = {
        left: r.left - containerRect.left,
        top: r.top - containerRect.top,
        right: r.right - containerRect.left,
        bottom: r.bottom - containerRect.top,
      };

      const intersects =
        cardRect.left < marqueeRect.right &&
        cardRect.right > marqueeRect.left &&
        cardRect.top < marqueeRect.bottom &&
        cardRect.bottom > marqueeRect.top;

      if (intersects) {
        const key = cardEl.getAttribute('data-key');
        if (key) intersecting.add(key);
      }
    });

    // union with the baseline so a marquee drag doesn't stomp a ctrl-held prior selection
    const merged = new Set(this.marqueeBaseSelection);
    intersecting.forEach(k => merged.add(k));

    this.selectedKeys.set(merged);
  }

  // --- selection ---

  isFolderSelected(folder: FolderPayload): boolean {
    return this.selectedKeys().has(entryKey('folder', folder.id));
  }

  isFileSelected(file: DocumentFilePayload): boolean {
    return this.selectedKeys().has(entryKey('file', file.id));
  }

  fileIndex(i: number): number {
    return this.deletedFolders().length + i;
  }

  getFileIcon(fileName: string): string {
    return getVSIFileIcon(fileName);
  }

  onItemClick(event: MouseEvent, type: 'folder' | 'file', item: FolderPayload | DocumentFilePayload): void {
    event.stopPropagation();
    const key = entryKey(type, item.id);

    if (event.ctrlKey || event.metaKey) {
      this.selectedKeys.update(keys => {
        const next = new Set(keys);
        next.has(key) ? next.delete(key) : next.add(key);
        return next;
      });
    } else {
      this.selectedKeys.set(new Set([key]));
    }

    this.closeContextMenu();
  }

  onGridMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (
      target.closest('app-document-context-menu') ||
      target.closest('app-document-empty-context-menu') ||
      target.closest('app-rename-popover') ||
      target.closest('app-properties-dialog') ||
      target.closest('.toolbar') ||
      target.closest('.folder-card') ||
      target.closest('.new-menu-wrapper') ||
      target.closest('.context-menu')
    ) {
      return;
    }
    if (event.target === event.currentTarget) {
      this.selectedKeys.set(new Set());
      this.closeContextMenu();
    }
  }

  private getSelectedEntries(): BinContextMenuTarget[] {
    const keys = this.selectedKeys();
    const folders: BinContextMenuTarget[] = this.deletedFolders()
      .filter(f => keys.has(entryKey('folder', f.id)))
      .map(item => ({ type: 'folder' as const, item }));
    const files: BinContextMenuTarget[] = this.deletedFiles()
      .filter(f => keys.has(entryKey('file', f.id)))
      .map(item => ({ type: 'file' as const, item }));
    return [...folders, ...files];
  }

  // --- context menu ---

  onFolderRightClick(event: MouseEvent, folder: FolderPayload): void {
    event.preventDefault();
    event.stopPropagation();
    const key = entryKey('folder', folder.id);
    if (!this.selectedKeys().has(key)) {
      this.selectedKeys.set(new Set([key]));
    }
    this.openContextMenu(event);
  }

  onFileRightClick(event: MouseEvent, file: DocumentFilePayload): void {
    event.preventDefault();
    event.stopPropagation();
    const key = entryKey('file', file.id);
    if (!this.selectedKeys().has(key)) {
      this.selectedKeys.set(new Set([key]));
    }
    this.openContextMenu(event);
  }

  private openContextMenu(event: MouseEvent): void {
    this.contextMenuTargets = this.getSelectedEntries();
    this.contextMenu = { x: event.clientX, y: event.clientY };
  }

  closeContextMenu(): void {
    this.contextMenu = null;
    this.contextMenuTargets = [];
  }


  restoreSelection(): void {
    const targets = this.contextMenuTargets;
    if (!targets.length) return;

    targets.forEach(t => {
      const request$ = (t.type === 'folder'
        ? this.folderService.restoreFolder(t.item.id)
        : this.folderService.restoreFile(t.item.id)) as any;

      request$.subscribe({
        error: (err: any) => console.error(`Failed to restore ${t.type}:`, err),
      });
    });

    this.selectedKeys.set(new Set());
    this.closeContextMenu();
  }

  deleteSelectionForever(): void {
    const targets = this.contextMenuTargets;
    if (!targets.length) return;

    const confirmed = confirm(`Permanently delete ${targets.length} item(s)? This cannot be undone.`);
    if (!confirmed) return;

    targets.forEach(t => {
      const request$ = (t.type === 'folder'
        ? this.folderService.permanentlyDeleteFolder(t.item.id)
        : this.folderService.permanentlyDeleteFile(t.item.id)) as any;

      request$.subscribe({
        error: (err: any) => console.error(`Failed to permanently delete ${t.type}:`, err),
      });
    });

    this.selectedKeys.set(new Set());
    this.closeContextMenu();
  }

  // --- properties ---

  showProperties(): void {
    const target = this.contextMenuTargets[0];
    if (!target) return;

    this.propertiesFavorite.set(false);
    if (target.type === 'folder') {
      this.propertiesFolder = target.item as FolderProps;
      this.propertiesFile = null;
    } else {
      this.propertiesFile = target.item as FileProps;
      this.propertiesFolder = null;
    }
    this.closeContextMenu();
  }

  closeProperties(): void {
    this.propertiesFolder = null;
    this.propertiesFile = null;
  }

  toggleFavorite(): void {
    this.propertiesFavorite.update(v => !v);
  }

  get propertiesIcon(): string {
    if (this.propertiesFolder) return '/internal-folder.png';
    return this.propertiesFile ? this.getFileIcon(this.propertiesFile.fileName) : '';
  }

  get propertiesName(): string {
    return this.propertiesFolder?.name ?? this.propertiesFile?.fileName ?? '';
  }

  get propertiesSubtitle(): string {
    const f = this.propertiesFolder;
    if (f) {
      const count = f.itemsCount ?? 0;
      const size = f.totalSizeLabel ?? '0 kB';
      return `${count} item${count === 1 ? '' : 's'}, totalling ${size}`;
    }
    const file = this.propertiesFile;
    return file ? (file.fileTypeLabel ?? getFileTypeLabel(file.fileName)) : '';
  }

  get propertiesSecondarySubtitle(): string {
    return this.propertiesFolder?.freeSpaceLabel ?? this.propertiesFile?.sizeLabel ?? '';
  }

  get propertiesParentPath(): string {
    return this.propertiesFolder?.parentPath ?? this.propertiesFile?.parentPath ?? '';
  }

  get propertiesModified(): string {
    return this.propertiesFolder?.modifiedAt ?? this.propertiesFile?.modifiedAt ?? '—';
  }

  get propertiesCreated(): string {
    return this.propertiesFolder?.createdAt ?? this.propertiesFile?.createdAt ?? '—';
  }

  get propertiesAccessed(): string | null {
    return this.propertiesFile?.accessedAt ?? null;
  }

  get propertiesPermissionsLabel(): string {
    return (
      this.propertiesFolder?.permissionsLabel ??
      this.propertiesFile?.permissionsLabel ??
      (this.propertiesFolder?.canCreate ? 'Create and Delete Files' : 'Read and Write')
    );
  }
}