import { Injectable, signal, computed } from '@angular/core';
import { DriveKey } from '../core/services/fileFolder-permission.service';


export interface FolderPayload {
    id: string;
    name: string;
    folderKey: string;
    parentFolderId: string | null;
    isSystem: boolean;
    canCreate: boolean;
    hasChildren: boolean;
    createdAt: string;
}

export interface DocumentFilePayload {
    id: string;
    name: string;
    fileName: string;
    contentType: string;
    storagePath: string;
    url: string;
    urlExpiresAt: string | null;
    size: number;
    isHidden: boolean;
    isDeleted: boolean;
    deletedAt: string | null;
    folderId: string;
    userId: string;
    uploadedAt: string;
    updatedAt: string | null;
    rowVersion: string | null;
    allowedUsersId: string[];
}

export interface DrivePayload {
    id: string;
    driveName: string;
    driveKey: DriveKey;
    canCreate: boolean;
    diskSize: number;
    folders : FolderPayload[],
    occupiedSpace: number;
}


@Injectable({ providedIn: 'root' })
export class FolderState {
    private _drives = signal<DrivePayload[]>([]);
    private _activeDrive = signal<DrivePayload | null>(null);
    private _rootFolders = signal<FolderPayload[]>([]);
    private _currentFolders = signal<FolderPayload[]>([]);
    private _currentFiles = signal<DocumentFilePayload[]>([]);
    private _currentPath = signal<FolderPayload[]>([]);
    private _binFolders = signal<FolderPayload[]>([]);
    private _binFiles = signal<DocumentFilePayload[]>([]);
    private _isBinLoading = signal(false);

    private _isLoading = signal(false);

    private _childrenCache = new Map<string, FolderPayload[]>();
    private _filesCache = new Map<string, DocumentFilePayload[]>();
    drives = computed(() => this._drives());
    activeDrive = computed(() => this._activeDrive());

    rootFolders = computed(() => this._rootFolders());
    currentFolders = computed(() => this._currentFolders());
    currentFiles = computed(() => this._currentFiles());
    currentPath = computed(() => this._currentPath());
    isLoading = computed(() => this._isLoading());
    isAtDriveList = computed(() => this._activeDrive() === null);
    isAtDriveRoot = computed(() => this._activeDrive() !== null && this._currentPath().length === 0);

    isAtRoot = computed(() => this._currentPath().length === 0);
    activeFolder = computed(() => {
        const path = this._currentPath();
        return path.length ? path[path.length - 1] : null;
    });
    breadcrumbLabel = computed(() =>
        this._currentPath().length
            ? 'Root / ' + this._currentPath().map(f => f.name).join(' / ')
            : 'Root'
    );

    isCurrentFolderEmpty = computed(() =>
        this._currentFolders().length === 0 && this._currentFiles().length === 0
    );


    binFolders = computed(() => this._binFolders());
    binFiles = computed(() => this._binFiles());
    isBinLoading = computed(() => this._isBinLoading());
    isBinEmpty = computed(() => this._binFolders().length === 0 && this._binFiles().length === 0);



    setBinFolders(folders: FolderPayload[]): void {
        this._binFolders.set(folders);
    }

    setBinFiles(files: DocumentFilePayload[]): void {
        this._binFiles.set(files);
    }

    setBinLoading(isLoading: boolean): void {
        this._isBinLoading.set(isLoading);
    }

    setRootFolders(folders: FolderPayload[]): void {
        this._rootFolders.set(folders);
        this._currentFolders.set(folders);
        this._currentFiles.set([]);
    }



    addFileLocally(file: DocumentFilePayload): void {
        this._currentFiles.update((files) => [...files, file]);

        if (this._filesCache.has(file.folderId)) {
            this._filesCache.set(file.folderId, [...this._filesCache.get(file.folderId)!, file]);
        }
    }


    renameFolderLocally(folderId: string, newName: string): void {
        const rename = (folders: FolderPayload[]) =>
            folders.map(f => (f.id === folderId ? { ...f, name: newName } : f));

        this._currentFolders.update(rename);
        this._rootFolders.update(rename);
        this._currentPath.update(rename);

        for (const [parentId, children] of this._childrenCache.entries()) {
            if (children.some(f => f.id === folderId)) {
                this._childrenCache.set(parentId, rename(children));
            }
        }
    }

    renameFileLocally(fileId: string, fileName: string, name: string): void {
        const rename = (files: DocumentFilePayload[]) =>
            files.map(f => (f.id === fileId ? { ...f, fileName: fileName, name: name } : f));

        this._currentFiles.update(rename);

        for (const [folderId, files] of this._filesCache.entries()) {
            if (files.some(f => f.id === fileId)) {
                this._filesCache.set(folderId, rename(files));
            }
        }
    }

    removeFolderLocally(folderId: string): FolderPayload | null {
        let removedFolder: FolderPayload | null = null;

        const remove = (folders: FolderPayload[]) => {
            const folder = folders.find(f => f.id === folderId);
            if (folder && !removedFolder) {
                removedFolder = folder;
            }
            return folders.filter(f => f.id !== folderId);
        };

        this._currentFolders.update(remove);
        this._rootFolders.update(remove);

        for (const [parentId, children] of this._childrenCache.entries()) {
            if (children.some(f => f.id === folderId)) {
                this._childrenCache.set(parentId, remove(children));
            }
        }

        return removedFolder;
    }

    removeFileLocally(fileId: string): DocumentFilePayload | null {
        let removedFile: DocumentFilePayload | null = null;

        const remove = (files: DocumentFilePayload[]) => {
            const file = files.find(f => f.id === fileId);
            if (file && !removedFile) {
                removedFile = file;
            }
            return files.filter(f => f.id !== fileId);
        };

        this._currentFiles.update(remove);

        for (const [folderId, files] of this._filesCache.entries()) {
            if (files.some(f => f.id === fileId)) {
                this._filesCache.set(folderId, remove(files));
            }
        }

        return removedFile;
    }

    removeBinFolderLocally(folderId: string): void {
        let restoredFolder: FolderPayload | undefined;

        this._binFolders.update(folders => {
            restoredFolder = folders.find(f => f.id === folderId);
            return folders.filter(f => f.id !== folderId);
        });

        if (!restoredFolder) return;

        const parentId = restoredFolder.parentFolderId ?? null;

        if (parentId) {
            const cachedChildren = this._childrenCache.get(parentId);
            if (cachedChildren) {
                if (!cachedChildren.some(f => f.id === restoredFolder!.id)) {
                    this._childrenCache.set(parentId, [...cachedChildren, restoredFolder]);
                }
            }
        }

        if (this.activeFolder()?.id === parentId) {
            this._currentFolders.update(folders => [...folders, restoredFolder!]);
        }
    }

    removeBinFileLocally(fileId: string): void {
        let restoredFile: DocumentFilePayload | undefined;

        this._binFiles.update(files => {
            restoredFile = files.find(f => f.id === fileId);
            return files.filter(f => f.id !== fileId);
        });

        if (!restoredFile) return;

        const parentId = restoredFile.folderId ?? null;

        if (parentId) {
            const cachedFiles = this._filesCache.get(parentId);
            if (cachedFiles) {
                if (!cachedFiles.some(f => f.id === restoredFile!.id)) {
                    this._filesCache.set(parentId, [...cachedFiles, restoredFile]);
                }
            }
        }

        if (this.activeFolder()?.id === parentId) {
            this._currentFiles.update(files => [...files, restoredFile!]);
        }
    }


    handleAddFileInTrash(deletedFile: DocumentFilePayload) {
        this._binFiles.update(files => [...files, deletedFile]);
    }

    handleAddFolderInTrash(deletedFolder: FolderPayload) {
        this._binFolders.update(folders => [...folders, deletedFolder]);
    }

    hasCachedChildren(folderId: string): boolean {
        return this._childrenCache.has(folderId);
    }

    getCachedChildren(folderId: string): FolderPayload[] {
        return this._childrenCache.get(folderId) ?? [];
    }

    cacheChildren(folderId: string, children: FolderPayload[]): void {
        this._childrenCache.set(folderId, children);
        console.log("CACHE ITEMS", this._childrenCache);
    }

    invalidateCachedChildren(folderId: string): void {
        this._childrenCache.delete(folderId);
    }

    hasCachedFiles(folderId: string): boolean {
        return this._filesCache.has(folderId);
    }

    getCachedFiles(folderId: string): DocumentFilePayload[] {
        return this._filesCache.get(folderId) ?? [];
    }

    cacheFiles(folderId: string, files: DocumentFilePayload[]): void {
        this._filesCache.set(folderId, files);
        console.log("CACHED FILES", this._filesCache);
    }

    invalidateCachedFiles(folderId: string): void {
        this._filesCache.delete(folderId);
    }



    resetToRoot(): void {
        this._currentPath.set([]);
        this._currentFolders.set(this._rootFolders());
        this._currentFiles.set([]);
    }



    // ---------- Drive setters ----------

    setDrives(drives: DrivePayload[]): void {
        this._drives.set(drives);
    }

    enterDrive(drive: DrivePayload, rootFolders: FolderPayload[]): void {
        this._activeDrive.set(drive);
        this._currentPath.set([]);
        this._rootFolders.set(rootFolders);
        this._currentFolders.set(rootFolders);
        this._currentFiles.set([]);
    }

    exitToDriveList(): void {
        this._activeDrive.set(null);
        this._currentPath.set([]);
        this._rootFolders.set([]);
        this._currentFolders.set([]);
        this._currentFiles.set([]);
    }

    setCurrentFolders(folders: FolderPayload[]): void { this._currentFolders.set(folders); }
    setCurrentFiles(files: DocumentFilePayload[]): void { this._currentFiles.set(files); }
    setCurrentContents(folders: FolderPayload[], files: DocumentFilePayload[]): void {
        this._currentFolders.set(folders);
        this._currentFiles.set(files);
    }
    setLoading(isLoading: boolean): void { this._isLoading.set(isLoading); }
    pushPath(folder: FolderPayload): void { this._currentPath.update(path => [...path, folder]); }

    addFolderLocally(folder: FolderPayload): void {
        this._currentFolders.update(folders => [...folders, folder]);

        if (this.isAtDriveRoot()) {              // was: this.isAtRoot()
            this._rootFolders.update(folders => [...folders, folder]);
        }

        const parentId = this.activeFolder()?.id ?? null;
        if (parentId && this._childrenCache.has(parentId)) {
            this._childrenCache.set(parentId, [...this._childrenCache.get(parentId)!, folder]);
        }
    }


    goToPathIndex(index: number): void {
        this._currentPath.update(path => (index < 0 ? [] : path.slice(0, index + 1)));
    }

    popPath(): void {
        this._currentPath.update(path => path.slice(0, -1));
    }

    resetToDriveRoot(): void {
        this._currentPath.set([]);
        this._currentFolders.set(this._rootFolders());
        this._currentFiles.set([]);
    }

    clear(): void {
        this._drives.set([]);
        this._activeDrive.set(null);
        this._rootFolders.set([]);
        this._currentFolders.set([]);
        this._currentFiles.set([]);
        this._currentPath.set([]);
        this._isLoading.set(false);
        this._childrenCache.clear();
        this._filesCache.clear();
    }
}