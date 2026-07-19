import { Component, ElementRef, HostListener, signal, ViewChild, computed, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentManagementService } from '../../../services/document-mangement.service';
import { DocumentFilePayload, FolderPayload, FolderState } from '../../../state/document-mangement.state';
import { TeamMessageAttachment, TeamAttachmentType } from '../../../core/types/teams.type';

import { getVSIFileIcon } from '@baybreezy/file-extension-icon';
import { AttachmentViewerComponent } from '../../../components/items/attachment-viewer/attachment-viewer.component';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';

type ContextMenuTarget =
  | { type: 'folder'; item: FolderPayload }
  | { type: 'file'; item: DocumentFilePayload };

interface ClipboardEntry {
  targets: ContextMenuTarget[];
  mode: 'cut' | 'copy';
}

type BinContextMenuTarget =
  | { type: 'folder'; item: FolderPayload }
  | { type: 'file'; item: DocumentFilePayload };

interface BinContextMenuState {
  x: number;
  y: number;
}

type FolderProps = FolderPayload & {
  itemsCount?: number;
  totalSizeLabel?: string;
  freeSpaceLabel?: string;
  parentPath?: string;
  modifiedAt?: string;
  permissionsLabel?: string;
};

type FileProps = DocumentFilePayload & {
  fileTypeLabel?: string;
  sizeLabel?: string;
  parentPath?: string;
  accessedAt?: string;
  modifiedAt?: string;
  createdAt?: string;
  permissionsLabel?: string;
};

function inferAttachmentType(contentType: string): TeamAttachmentType {
  const ct = contentType?.toLowerCase() ?? '';
  if (ct.startsWith('image/')) return 'image' as TeamAttachmentType;
  if (ct.startsWith('video/')) return 'video' as TeamAttachmentType;
  if (ct.startsWith('audio/')) return 'audio' as TeamAttachmentType;
  return 'document' as TeamAttachmentType;
}

function toTeamAttachment(file: DocumentFilePayload): TeamMessageAttachment {
  return {
    id: file.id,
    fileName: file.fileName || file.name,
    fileUrl: file.url,
    uploadId: file.id,
    contentType: file.contentType,
    attachmentType: inferAttachmentType(file.contentType),
    sizeBytes: file.size,
    createdAt: file.uploadedAt,
  };
}

@Component({
  selector: 'app-document-management',
  imports: [CommonModule, FormsModule, AttachmentViewerComponent],
  templateUrl: './document-management.component.html',
  styleUrl: './document-management.component.scss',
})
export class DocumentManagementComponent {

  view: 'folders' | 'recycle-bin' = 'folders';

  contextMenu: { x: number; y: number; target: ContextMenuTarget } | null = null;
  propertiesFolder: FolderProps | null = null;
  propertiesFile: FileProps | null = null;
  propertiesFavorite = signal(false);

  createMenuOpen = signal(false);
  uploading = signal(false);
  uploadError = signal<string | null>(null);

  selectedAttachment = signal<TeamMessageAttachment | null>(null);
  allAttachments = computed(() => this.currentFiles.map(toTeamAttachment));

  selectedKeys = signal<Set<string>>(new Set());
  selectedCount = computed(() => this.selectedKeys().size);
  private lastSelectedIndex: number | null = null;


  private binSelectedKeys = signal<Set<string>>(new Set());
  binSelectedCount = computed(() => this.binSelectedKeys().size);

  deletedFolders = computed(() => this.folderState.binFolders());
  deletedFiles = computed(() => this.folderState.binFiles());

  binContextMenu: BinContextMenuState | null = null;
  private binContextMenuTargets: BinContextMenuTarget[] = [];

  isMarqueeSelecting = signal(false);
  marqueeBox = signal<{ left: number; top: number; width: number; height: number } | null>(null);
  private dragStartX = 0;
  private dragStartY = 0;
  private dragAdditive = false;
  private marqueeBaseSelection = new Set<string>();

  clipboard = signal<ClipboardEntry | null>(null);
  cutKeys = computed(() =>
    this.clipboard()?.mode === 'cut'
      ? new Set(this.clipboard()!.targets.map(t => this.keyFor(t.type, t.item.id)))
      : new Set<string>()
  );

  draggingKeys = signal<Set<string>>(new Set());
  dragOverFolderId = signal<string | null>(null);
  dragOverBreadcrumbIndex = signal<number | null>(null);
  isPasting = signal(false);

  renameTarget = signal<ContextMenuTarget | null>(null);
  renameValue = signal('');
  renamePosition = signal<{ x: number; y: number } | null>(null);

  @ViewChild('gridEl') gridEl!: ElementRef<HTMLDivElement>;

  constructor(
    private folderService: DocumentManagementService,
    public folderState: FolderState,
  ) { }

  get currentFolders(): FolderPayload[] {
    return this.folderState.currentFolders();
  }

  get currentFiles(): DocumentFilePayload[] {
    return this.folderState.currentFiles();
  }

  get currentPath(): FolderPayload[] {
    return this.folderState.currentPath();
  }

  get loading(): boolean {
    return this.folderState.isLoading();
  }

  get canCreateHere(): boolean {
    const active = this.folderState.activeFolder();
    return active ? active.canCreate : true;
  }

  get currentPathLabel(): string {
    return this.folderState.breadcrumbLabel();
  }

  get contextMenuIsFolder(): boolean {
    return this.contextMenu?.target.type === 'folder';
  }

  get contextMenuFolder(): FolderPayload | null {
    return this.contextMenu?.target.type === 'folder' ? this.contextMenu.target.item : null;
  }

  get contextMenuFile(): DocumentFilePayload | null {
    return this.contextMenu?.target.type === 'file' ? this.contextMenu.target.item : null;
  }

  get contextMenuName(): string {
    return this.contextMenuFolder?.name ?? this.contextMenuFile?.fileName ?? '';
  }

  get contextMenuIsSystem(): boolean {
    return this.contextMenuFolder?.isSystem ?? false;
  }


  get propertiesIcon(): string {
    if (this.propertiesFolder) {
      return this.currentPath.length > 0 ? '/internal-folder.png' : '/root-folder.png';
    }
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
    return file ? (file.fileTypeLabel ?? this.getFileTypeLabel(file.fileName)) : '';
  }

  get propertiesSecondarySubtitle(): string {
    return this.propertiesFolder?.freeSpaceLabel ?? this.propertiesFile?.sizeLabel ?? '';
  }

  get propertiesParentPath(): string {
    return this.propertiesFolder?.parentPath ?? this.propertiesFile?.parentPath ?? this.currentPathLabel;
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



  get selectionHasSystemItem(): boolean {
    return this.getSelectedEntries().some(e => e.type === 'folder' && e.item.isSystem);
  }


  // --- bin selection state ---


  private binKeyFor(type: 'folder' | 'file', id: string): string {
    return `${type}:${id}`;
  }

  isBinFolderSelected(folder: FolderPayload): boolean {
    return this.binSelectedKeys().has(this.binKeyFor('folder', folder.id));
  }

  isBinFileSelected(file: DocumentFilePayload): boolean {
    return this.binSelectedKeys().has(this.binKeyFor('file', file.id));
  }

  binFileIndex(i: number): number {
    return this.deletedFolders().length + i;
  }

  onBinItemClick(event: MouseEvent, type: 'folder' | 'file', item: FolderPayload | DocumentFilePayload, index: number): void {
    event.stopPropagation();
    const key = this.binKeyFor(type, item.id);

    if (event.ctrlKey || event.metaKey) {
      this.binSelectedKeys.update(keys => {
        const next = new Set(keys);
        next.has(key) ? next.delete(key) : next.add(key);
        return next;
      });
    } else {
      this.binSelectedKeys.set(new Set([key]));
    }

    this.closeBinContextMenu();
  }

  onBinGridMouseDown(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.binSelectedKeys.set(new Set());
      this.closeBinContextMenu();
    }
  }

  private getBinSelectedEntries(): BinContextMenuTarget[] {
    const keys = this.binSelectedKeys();
    const folders: BinContextMenuTarget[] = this.deletedFolders()
      .filter(f => keys.has(this.binKeyFor('folder', f.id)))
      .map(item => ({ type: 'folder' as const, item }));
    const files: BinContextMenuTarget[] = this.deletedFiles()
      .filter(f => keys.has(this.binKeyFor('file', f.id)))
      .map(item => ({ type: 'file' as const, item }));
    return [...folders, ...files];
  }

  onBinFolderRightClick(event: MouseEvent, folder: FolderPayload): void {
    event.preventDefault();
    event.stopPropagation();

    const key = this.binKeyFor('folder', folder.id);
    if (!this.binSelectedKeys().has(key)) {
      this.binSelectedKeys.set(new Set([key]));
    }

    this.openBinContextMenu(event);
  }

  onBinFileRightClick(event: MouseEvent, file: DocumentFilePayload): void {
    event.preventDefault();
    event.stopPropagation();

    const key = this.binKeyFor('file', file.id);
    if (!this.binSelectedKeys().has(key)) {
      this.binSelectedKeys.set(new Set([key]));
    }

    this.openBinContextMenu(event);
  }

  private openBinContextMenu(event: MouseEvent): void {
    this.binContextMenuTargets = this.getBinSelectedEntries();
    this.binContextMenu = { x: event.clientX, y: event.clientY };
  }

  closeBinContextMenu(): void {
    this.binContextMenu = null;
    this.binContextMenuTargets = [];
  }

  binMenuOpen(): void {
    const target = this.binContextMenuTargets[0];
    if (!target) return;

    if (target.type === 'file') {
    }

    this.closeBinContextMenu();
  }

  binMenuRestore(): void {
    const targets = this.binContextMenuTargets;
    if (!targets.length) return;

    targets.forEach(t => {
      const request$ = (t.type === 'folder'
        ? this.folderService.restoreFolder(t.item.id)
        : this.folderService.restoreFile(t.item.id)) as any;

      request$.subscribe({
        error: (err: any) => console.error(`Failed to restore ${t.type}:`, err)
      });
    });

    this.binSelectedKeys.set(new Set());
    this.closeBinContextMenu();
  }

  binMenuDeleteForever(): void {
    const targets = this.binContextMenuTargets;
    if (!targets.length) return;

    const confirmed = confirm(
      `Permanently delete ${targets.length} item(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    targets.forEach(t => {
      const request$ = (t.type === 'folder'
        ? this.folderService.permanentlyDeleteFolder(t.item.id)
        : this.folderService.permanentlyDeleteFile(t.item.id)) as any;

      request$.subscribe({
        error: (err: any) => console.error(`Failed to permanently delete ${t.type}:`, err)
      });
    });

    this.binSelectedKeys.set(new Set());
    this.closeBinContextMenu();
  }


  // --- Selection helpers ---


  private keyFor(type: 'folder' | 'file', id: string): string {
    return `${type}:${id}`;
  }

  isFolderSelected(folder: FolderPayload): boolean {
    return this.selectedKeys().has(this.keyFor('folder', folder.id));
  }

  isFileSelected(file: DocumentFilePayload): boolean {
    return this.selectedKeys().has(this.keyFor('file', file.id));
  }

  isCut(type: 'folder' | 'file', id: string): boolean {
    return this.cutKeys().has(this.keyFor(type, id));
  }

  isDragging(type: 'folder' | 'file', id: string): boolean {
    return this.draggingKeys().has(this.keyFor(type, id));
  }

  fileIndex(i: number): number {
    return this.currentFolders.length + i;
  }

  private combinedItems(): ContextMenuTarget[] {
    return [
      ...this.currentFolders.map(item => ({ type: 'folder' as const, item })),
      ...this.currentFiles.map(item => ({ type: 'file' as const, item })),
    ];
  }

  private getSelectedEntries(): ContextMenuTarget[] {
    const keys = this.selectedKeys();
    return this.combinedItems().filter(entry => keys.has(this.keyFor(entry.type, entry.item.id)));
  }

  clearSelection() {
    this.selectedKeys.set(new Set());
    this.lastSelectedIndex = null;
  }

  onItemClick(event: MouseEvent, type: 'folder' | 'file', item: FolderPayload | DocumentFilePayload, index: number) {
    event.stopPropagation();
    this.cancelRename();
    const key = this.keyFor(type, item.id);

    if (event.shiftKey && this.lastSelectedIndex !== null) {
      this.selectRange(this.lastSelectedIndex, index);
    } else if (event.ctrlKey || event.metaKey) {
      const keys = new Set(this.selectedKeys());
      keys.has(key) ? keys.delete(key) : keys.add(key);
      this.selectedKeys.set(keys);
      this.lastSelectedIndex = index;
    } else {
      this.selectedKeys.set(new Set([key]));
      this.lastSelectedIndex = index;
    }
  }

  private selectRange(from: number, to: number) {
    const items = this.combinedItems();
    const [start, end] = from <= to ? [from, to] : [to, from];
    const keys = new Set(this.selectedKeys());
    for (let i = start; i <= end; i++) {
      const entry = items[i];
      if (entry) keys.add(this.keyFor(entry.type, entry.item.id));
    }
    this.selectedKeys.set(keys);
  }


  private getFileTypeLabel(fileName: string): string {
    const ext = fileName.split('.').pop()?.toUpperCase() ?? '';
    return ext ? `${ext} document` : 'File';
  }




  // --- Marquee (rubber-band) select ---

  onGridMouseDown(event: MouseEvent) {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('.folder-card')) return;

    this.cancelRename();
    this.dragAdditive = event.ctrlKey || event.metaKey || event.shiftKey;
    this.marqueeBaseSelection = this.dragAdditive ? new Set(this.selectedKeys()) : new Set();
    this.selectedKeys.set(new Set(this.marqueeBaseSelection));

    const rect = this.gridEl.nativeElement.getBoundingClientRect();
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.isMarqueeSelecting.set(true);
    this.marqueeBox.set({ left: event.clientX - rect.left, top: event.clientY - rect.top, width: 0, height: 0 });
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent) {
    if (!this.isMarqueeSelecting() || !this.gridEl) return;
    const rect = this.gridEl.nativeElement.getBoundingClientRect();
    const left = Math.min(this.dragStartX, event.clientX) - rect.left;
    const top = Math.min(this.dragStartY, event.clientY) - rect.top;
    const width = Math.abs(event.clientX - this.dragStartX);
    const height = Math.abs(event.clientY - this.dragStartY);
    this.marqueeBox.set({ left, top, width, height });
    this.updateMarqueeSelection(event);
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp() {
    if (!this.isMarqueeSelecting()) return;
    this.isMarqueeSelecting.set(false);
    this.marqueeBox.set(null);
  }

  private updateMarqueeSelection(event: MouseEvent) {
    const marqueeRect = {
      left: Math.min(this.dragStartX, event.clientX),
      right: Math.max(this.dragStartX, event.clientX),
      top: Math.min(this.dragStartY, event.clientY),
      bottom: Math.max(this.dragStartY, event.clientY),
    };
    const cards = this.gridEl.nativeElement.querySelectorAll<HTMLElement>('.folder-card[data-key]');
    const keys = new Set(this.marqueeBaseSelection);
    cards.forEach(card => {
      const r = card.getBoundingClientRect();
      const intersects = !(r.right < marqueeRect.left || r.left > marqueeRect.right ||
        r.bottom < marqueeRect.top || r.top > marqueeRect.bottom);
      if (intersects) keys.add(card.dataset['key']!);
    });
    this.selectedKeys.set(keys);
  }

  // --- Actions ---

  toggleFavorite() {
    this.propertiesFavorite.update((v) => !v);
  }

  editFolderIcon() { }
  openParentFolderLocation() { }
  openPermissions() { }

  ngOnInit() {
    this.folderService.loadRootFolders().subscribe();
    this.folderService.loadBinItems();
  }

  openFolder(folder: FolderPayload) {
    this.folderService.openFolder(folder).subscribe();
  }

  openFile(file: DocumentFilePayload) {
    this.selectedAttachment.set(toTeamAttachment(file));
  }

  closeViewer() {
    this.selectedAttachment.set(null);
  }

  getFileIcon(fileName: string): string {
    return getVSIFileIcon(fileName);
  }

  goToBreadcrumb(index: number) {
    this.folderService.goToBreadcrumb(index);
  }

  goBack() {
    this.folderService.goBack();
  }

  openRecycleBin() {
    this.closeContextMenu();
    this.view = 'recycle-bin';
  }

  exitRecycleBin() {
    this.view = 'folders';
  }

  restoreFolder(folder: FolderPayload) { }

  permanentlyDeleteFolder(folder: FolderPayload) {
    const confirmed = confirm(`Permanently delete "${folder.name}"? This cannot be undone.`);
    if (!confirmed) return;
  }

  toggleCreateMenu(event: MouseEvent) {
    event.stopPropagation();
    this.createMenuOpen.update((open) => !open);
  }

  closeCreateMenu() {
    this.createMenuOpen.set(false);
  }

  addFolder() {
    this.closeCreateMenu();
    const folderName = prompt('Folder Name');
    if (!folderName?.trim()) return;
    const parentId = this.folderState.activeFolder()?.id ?? null;
    this.folderService.createFolder(parentId, folderName.trim()).subscribe({
      next: (createdFolder) => this.folderState.addFolderLocally(createdFolder),
      error: () => this.uploadError.set('Could not create folder. Please try again.'),
    });
  }

  triggerFileUpload() {
    const inputFile = document.getElementById("file-input") as HTMLInputElement;
    inputFile.click();
    this.closeCreateMenu();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const files: File[] = Array.from(input.files);
    input.value = '';
    if (!files || !files.length) return;

    const parentId = this.folderState.activeFolder()?.id ?? null;
    this.uploading.set(true);
    this.uploadError.set(null);

    this.folderService.uploadFiles(parentId, Array.from(files)).subscribe({
      next: (uploadedFiles) => {
        uploadedFiles.forEach((file) => this.folderState.addFileLocally(file));
        this.uploading.set(false);
      },
      error: () => {
        this.uploading.set(false);
        this.uploadError.set('Upload failed. Please try again.');
      },
    });
  }

  onFolderRightClick(event: MouseEvent, folder: FolderPayload) {
    event.preventDefault();
    event.stopPropagation();
    this.cancelRename();
    const key = this.keyFor('folder', folder.id);
    if (!this.selectedKeys().has(key)) {
      this.selectedKeys.set(new Set([key]));
    }
    this.contextMenu = { x: event.clientX, y: event.clientY, target: { type: 'folder', item: folder } };
  }

  onFileRightClick(event: MouseEvent, file: DocumentFilePayload) {
    event.preventDefault();
    event.stopPropagation();
    const key = this.keyFor('file', file.id);
    if (!this.selectedKeys().has(key)) {
      this.selectedKeys.set(new Set([key]));
    }
    this.contextMenu = { x: event.clientX, y: event.clientY, target: { type: 'file', item: file } };
  }

  closeContextMenu() {
    this.contextMenu = null;
  }

  menuOpen() {
    if (!this.contextMenu) return;
    if (this.contextMenu.target.type === 'folder') {
      this.openFolder(this.contextMenu.target.item);
    } else {
      this.openFile(this.contextMenu.target.item);
    }
    this.closeContextMenu();
  }

  menuProperties() {
    if (!this.contextMenu) return;
    this.propertiesFavorite.set(false);
    if (this.contextMenu.target.type === 'folder') {
      this.propertiesFolder = this.contextMenu.target.item as FolderProps;
      this.propertiesFile = null;
    } else {
      this.propertiesFile = this.contextMenu.target.item as FileProps;
      this.propertiesFolder = null;
    }
    this.closeContextMenu();
  }

  closeProperties() {
    this.propertiesFolder = null;
    this.propertiesFile = null;
  }


  menuRename() {
    if (!this.contextMenu || this.contextMenuIsSystem || this.selectedCount() > 1) return;

    const target = this.contextMenu.target;
    const currentName = target.type === 'folder' ? target.item.name : target.item.name;

    this.renameTarget.set(target);
    this.renameValue.set(currentName);
    this.renamePosition.set({ x: this.contextMenu.x, y: this.contextMenu.y });
    this.closeContextMenu();

    setTimeout(() => {
      const el = document.getElementById('rename-input') as HTMLInputElement | null;
      el?.focus();
      el?.select();
    });
  }


  confirmRename() {
    const target = this.renameTarget();
    const newName = this.renameValue().trim();
    if (!target || !newName) {
      this.cancelRename();
      return;
    }

    if (target.type === 'folder') {
      if (newName === target.item.name) {
        this.cancelRename();
        return;
      }
      const folderId = target.item.id;
      this.folderService.renameFolder(folderId, newName).subscribe({
        next: () => this.folderState.renameFolderLocally(folderId, newName),
        error: (err) => this.uploadError.set(err?.error?.message ?? 'Could not rename folder.'),
      });
    } else {
      if (newName === target.item.fileName) {
        this.cancelRename();
        return;
      }
      const fileId = target.item.id;
      this.folderService.renameFile(fileId, newName).subscribe({
        next: () => {
          const extension = target.item.fileName.toString().split('.')[1];
          this.folderState.renameFileLocally(fileId, `${newName}.${extension}`, newName);
        },
        error: (err) => this.uploadError.set(err?.error?.message ?? 'Could not rename file.'),
      });
    }

    this.cancelRename();
  }

  cancelRename() {
    this.renameTarget.set(null);
    this.renameValue.set('');
    this.renamePosition.set(null);
  }


  onRenameKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.confirmRename();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelRename();
    }
  }


  menuCut() {
    if (this.selectionHasSystemItem) return;
    const targets = this.getSelectedEntries();
    if (!targets.length) return;
    this.clipboard.set({ targets, mode: 'cut' });
    this.closeContextMenu();
  }

  menuCopy() {
    const targets = this.getSelectedEntries();
    if (!targets.length) return;
    this.clipboard.set({ targets, mode: 'copy' });
    this.closeContextMenu();
  }

  menuPaste() {
    this.pasteIntoFolder(this.folderState.activeFolder()?.id ?? null);
    this.closeContextMenu();
  }


  get canPaste(): boolean {
    return !!this.clipboard() && this.canCreateHere;
  }

  private pasteIntoFolder(targetFolderId: string | null) {
    const clip = this.clipboard();
    if (!clip || !clip.targets.length) return;

    const fileTargets = clip.targets.filter(t => t.type === 'file');
    if (fileTargets.length && !targetFolderId) {
      this.uploadError.set('Files cannot be moved to the root.');
      return;
    }

    this.isPasting.set(true);
    const calls = clip.targets.map(target => {
      if (target.type === 'folder') {
        const call$ = clip.mode === 'copy'
          ? this.folderService.copyFolder(target.item.id, targetFolderId)
          : this.folderService.moveFolder(target.item.id, targetFolderId);
        return call$.pipe(
          catchError(err => of({ __error: err?.error?.message ?? 'Could not process folder.' }))
        );
      } else {
        const call$ = clip.mode === 'copy'
          ? this.folderService.copyFile(target.item.id, targetFolderId!)
          : this.folderService.moveFile(target.item.id, targetFolderId!);
        return call$.pipe(
          catchError(err => of({ __error: err?.error?.message ?? 'Could not process file.' }))
        );
      }
    });

    forkJoin(calls).subscribe(results => {
      this.isPasting.set(false);
      const firstError = results.find((r: any) => r?.__error);
      if (firstError) this.uploadError.set((firstError as any).__error);

      results.forEach((result: any, i) => {
        if (result?.__error) return;
        const target = clip.targets[i];

        if (target.type === 'folder') {
          if (clip.mode === 'cut') this.folderState.removeFolderLocally(target.item.id);
          if (this.folderState.activeFolder()?.id === targetFolderId || (!targetFolderId && this.folderState.isAtRoot())) {
            this.folderState.addFolderLocally(result as FolderPayload);
          }
        } else {
          if (clip.mode === 'cut') this.folderState.removeFileLocally(target.item.id);
          if (this.folderState.activeFolder()?.id === targetFolderId) {
            this.folderState.addFileLocally(result as DocumentFilePayload);
          }
        }
      });

      if (clip.mode === 'cut') this.clipboard.set(null);
    });
  }

  @HostListener('document:keydown', ['$event'])
  onClipboardKeydown(event: KeyboardEvent) {
    const isMod = event.ctrlKey || event.metaKey;
    if (!isMod || this.renameTarget()) return;

    const tag = (event.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (event.key.toLowerCase() === 'x') { event.preventDefault(); this.menuCutFromSelection(); }
    if (event.key.toLowerCase() === 'c') { event.preventDefault(); this.menuCopyFromSelection(); }
    if (event.key.toLowerCase() === 'v') { event.preventDefault(); this.menuPaste(); }
  }

  private menuCutFromSelection() {
    if (this.selectionHasSystemItem) return;
    const targets = this.getSelectedEntries();
    if (!targets.length) return;
    this.clipboard.set({ targets, mode: 'cut' });
  }

  private menuCopyFromSelection() {
    const targets = this.getSelectedEntries();
    if (!targets.length) return;
    this.clipboard.set({ targets, mode: 'copy' });
  }



  onDragStart(event: DragEvent, type: 'folder' | 'file', item: FolderPayload | DocumentFilePayload, index: number) {
    if (type === 'folder' && (item as FolderPayload).isSystem) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    this.cancelRename();
    const key = this.keyFor(type, item.id);

    if (!this.selectedKeys().has(key)) {
      this.selectedKeys.set(new Set([key]));
      this.lastSelectedIndex = index;
    }

    this.draggingKeys.set(new Set(this.selectedKeys()));
    event.dataTransfer?.setData('text/plain', key);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragEnd() {
    this.draggingKeys.set(new Set());
    this.dragOverFolderId.set(null);
    this.dragOverBreadcrumbIndex.set(null);
  }

  onFolderDragOver(event: DragEvent, folder: FolderPayload) {
    if (!this.draggingKeys().size) return;
    if (this.draggingKeys().has(this.keyFor('folder', folder.id))) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dragOverFolderId.set(folder.id);
  }

  onFolderDragLeave(folder: FolderPayload) {
    if (this.dragOverFolderId() === folder.id) this.dragOverFolderId.set(null);
  }

  onFolderDrop(event: DragEvent, folder: FolderPayload) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverFolderId.set(null);
    this.dropSelectionInto(folder.id, event);
  }

  onBreadcrumbDragOver(event: DragEvent, index: number) {
    if (!this.draggingKeys().size) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dragOverBreadcrumbIndex.set(index);
  }

  onBreadcrumbDragLeave(index: number) {
    if (this.dragOverBreadcrumbIndex() === index) this.dragOverBreadcrumbIndex.set(null);
  }

  onBreadcrumbDrop(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverBreadcrumbIndex.set(null);
    const targetFolderId = index === -1 ? null : this.currentPath[index]?.id ?? null;
    this.dropSelectionInto(targetFolderId, event);
  }

  private dropSelectionInto(targetFolderId: string | null, event: DragEvent) {
    const keys = this.draggingKeys();
    if (!keys.size) return;

    const entries = this.combinedItems().filter(e => keys.has(this.keyFor(e.type, e.item.id)));
    this.draggingKeys.set(new Set());
    if (!entries.length) return;

    const fileEntries = entries.filter(e => e.type === 'file');
    if (fileEntries.length && !targetFolderId) {
      this.uploadError.set('Files cannot be moved to the root.');
      return;
    }

    const isCopy = event.ctrlKey || event.metaKey;

    const calls = entries.map(target => {
      if (target.type === 'folder') {
        const call$ = isCopy
          ? this.folderService.copyFolder(target.item.id, targetFolderId)
          : this.folderService.moveFolder(target.item.id, targetFolderId);
        return call$.pipe(catchError(err => of({ __error: err?.error?.message ?? 'Could not move folder.' })));
      } else {
        const call$ = isCopy
          ? this.folderService.copyFile(target.item.id, targetFolderId!)
          : this.folderService.moveFile(target.item.id, targetFolderId!);
        return call$.pipe(catchError(err => of({ __error: err?.error?.message ?? 'Could not move file.' })));
      }
    });

    forkJoin(calls).subscribe(results => {
      const firstError = results.find((r: any) => r?.__error);
      if (firstError) this.uploadError.set((firstError as any).__error);

      results.forEach((result: any, i) => {
        if (result?.__error) return;
        const target = entries[i];
        if (!isCopy) {
          target.type === 'folder'
            ? this.folderState.removeFolderLocally(target.item.id)
            : this.folderState.removeFileLocally(target.item.id);
        }
        if (targetFolderId) {
          this.folderState.invalidateCachedChildren(targetFolderId);
          this.folderState.invalidateCachedFiles(targetFolderId);
        }
      });

      this.clearSelection();
    });
  }




  @HostListener('document:click')
  @HostListener('document:contextmenu')
  @HostListener('window:scroll')
  onDocumentInteraction() {
    this.closeContextMenu();
    this.closeCreateMenu();
    this.cancelRename();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeContextMenu();
    this.closeProperties();
    this.closeCreateMenu();
    this.clearSelection();
    this.cancelRename();
  }


  menuCopyPath() {
    if (!this.contextMenu || this.selectedCount() > 1) return;
    const path = [...this.currentPath.map(f => f.name), this.contextMenuName].join(' / ');
    navigator.clipboard?.writeText(path).catch(() => { });
    this.closeContextMenu();
  }

  menuCreateShortcut() {
    if (!this.contextMenu || this.selectedCount() > 1) return;
    this.closeContextMenu();
  }

  menuDelete() {
    if (this.selectionHasSystemItem) return;
    const targets = this.getSelectedEntries();
    if (!targets.length) return;

    this.folderService.deleteItems(targets).subscribe(results => {
      const failed = results.filter(r => !r.success);
      if (failed.length) {
        console.error('Some items failed to delete:', failed);
      }
    });

    this.closeContextMenu();
  }

}


