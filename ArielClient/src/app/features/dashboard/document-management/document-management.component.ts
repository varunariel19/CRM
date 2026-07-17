import { Component, ElementRef, HostListener, input, signal, ViewChild } from '@angular/core';
import { FolderService } from '../../../services/document-mangement.service';
import { FolderPayload, FolderState } from '../../../state/document-mangement.state';

interface ClipboardEntry {
  folder: FolderPayload;
  mode: 'cut' | 'copy';
}

@Component({
  selector: 'app-document-management',
  imports: [],
  templateUrl: './document-management.component.html',
  styleUrl: './document-management.component.scss',
})
export class DocumentManagementComponent {

  view: 'folders' | 'recycle-bin' = 'folders';

  contextMenu: { x: number; y: number; folder: FolderPayload } | null = null;
  clipboard: ClipboardEntry | null = null;
  propertiesFolder: FolderPayload | null = null;
  deletedFolders: any[] = [];

  createMenuOpen = signal(false);
  uploading = signal(false);
  uploadError = signal<string | null>(null);

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private folderService: FolderService,
    public folderState: FolderState,
  ) { }

  get currentFolders(): FolderPayload[] {
    return this.folderState.currentFolders();
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

  ngOnInit() {
    this.folderService.loadRootFolders().subscribe();
  }

  openFolder(folder: FolderPayload) {
    this.folderService.openFolder(folder).subscribe();
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

  restoreFolder(folder: FolderPayload) {
  }

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
    if (!input.files || input.files.length === 0) {
      return;
    }
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
    this.contextMenu = { x: event.clientX, y: event.clientY, folder };
  }

  closeContextMenu() {
    this.contextMenu = null;
  }

  menuOpen() {
    if (!this.contextMenu) return;
    this.openFolder(this.contextMenu.folder);
    this.closeContextMenu();
  }

  menuRename() {
    if (!this.contextMenu || this.contextMenu.folder.isSystem) return;

    const folder = this.contextMenu.folder;
    const newName = prompt('Rename folder', folder.name);

    if (newName?.trim()) {
    }
    this.closeContextMenu();
  }

  menuCut() {
    if (!this.contextMenu || this.contextMenu.folder.isSystem) return;
    this.clipboard = { folder: this.contextMenu.folder, mode: 'cut' };
    this.closeContextMenu();
  }

  menuCopy() {
    if (!this.contextMenu) return;
    this.clipboard = { folder: this.contextMenu.folder, mode: 'copy' };
    this.closeContextMenu();
  }

  menuPaste() {
    this.pasteIntoCurrent();
    this.closeContextMenu();
  }

  pasteIntoCurrent() {
    if (!this.clipboard || !this.canCreateHere) return;

    const targetId = this.folderState.activeFolder()?.id ?? null;

    if (this.clipboard.mode === 'copy') {
      // TODO: this.folderService.copyFolder(this.clipboard.folder.id, targetId).subscribe();
    } else {
      // TODO: this.folderService.moveFolder(this.clipboard.folder.id, targetId).subscribe();
      this.clipboard = null;
    }
  }

  menuCopyPath() {
    if (!this.contextMenu) return;
    const path = [...this.currentPath.map(f => f.name), this.contextMenu.folder.name].join(' / ');
    navigator.clipboard?.writeText(path).catch(() => { });
    this.closeContextMenu();
  }

  menuCreateShortcut() {
    if (!this.contextMenu) return;
    this.closeContextMenu();
  }

  menuDelete() {
    if (!this.contextMenu || this.contextMenu.folder.isSystem) return;
    this.closeContextMenu();
  }

  menuProperties() {
    if (!this.contextMenu) return;
    this.propertiesFolder = this.contextMenu.folder;
    this.closeContextMenu();
  }

  closeProperties() {
    this.propertiesFolder = null;
  }

  @HostListener('document:click')
  @HostListener('document:contextmenu')
  @HostListener('window:scroll')
  onDocumentInteraction() {
    this.closeContextMenu();
    this.closeCreateMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeContextMenu();
    this.closeProperties();
    this.closeCreateMenu();
  }
}