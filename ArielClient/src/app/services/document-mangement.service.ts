// services/document-mangement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, finalize, forkJoin, map, of, tap } from 'rxjs';
import { endpoints } from '../core/constants/endpoints';
import { DocumentFilePayload, DrivePayload, FolderPayload, FolderState } from '../state/document-mangement.state';

interface FolderContentsResponse {
    currentFolder: FolderPayload;
    folders: FolderPayload[];
    files: DocumentFilePayload[];
}

export interface SelectedEntry {
    id: string;
    type: 'folder' | 'file';
}

type ContextMenuTarget =
    | { type: 'folder'; item: FolderPayload }
    | { type: 'file'; item: DocumentFilePayload };

export interface DeleteResult {
    id: string;
    type: 'folder' | 'file';
    success: boolean;
    error?: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentManagementService {

    constructor(
        private http: HttpClient,
        private folderState: FolderState,
    ) { }

    loadDrives(): Observable<DrivePayload[]> {
        this.folderState.setLoading(true);
        return this.http
            .get<DrivePayload[]>(endpoints.documentManagment.root, { withCredentials: true })
            .pipe(
                tap(drives => this.folderState.setDrives(drives)),
                catchError((err: HttpErrorResponse) => {
                    console.error(this.resolveError(err));
                    return of([]);
                }),
                finalize(() => this.folderState.setLoading(false)),
            );
    }

    openFolder(folder: FolderPayload): Observable<FolderContentsResponse | null> {
        if (this.folderState.hasCachedChildren(folder.id)) {
            const cachedFolders = this.folderState.getCachedChildren(folder.id);
            const cachedFiles = this.folderState.getCachedFiles(folder.id);
            this.folderState.pushPath(folder);
            this.folderState.setCurrentContents(cachedFolders, cachedFiles);
            return of({ currentFolder: folder, folders: cachedFolders, files: cachedFiles });
        }

        this.folderState.setLoading(true);

        return this.http
            .get<FolderContentsResponse>(endpoints.documentManagment.children(folder.id), { withCredentials: true })
            .pipe(
                tap((res) => {
                    this.folderState.pushPath(folder);
                    this.folderState.setCurrentContents(res.folders, res.files);
                    this.folderState.cacheChildren(folder.id, res.folders);
                    this.folderState.cacheFiles(folder.id, res.files);
                }),
                catchError((err: HttpErrorResponse) => {
                    console.error(this.resolveError(err));
                    return of(null);
                }),
                finalize(() => this.folderState.setLoading(false)),
            );
    }

    goToBreadcrumb(index: number): void {
        // index -1 => back to drive list entirely
        if (index === -1) {
            this.folderState.exitToDriveList();
            return;
        }
        // index 0 => active drive's own root (crumb[0] is the drive name)
        this.folderState.goToPathIndex(index - 1);   // shift by 1 since path no longer includes the drive itself

        const active = this.folderState.activeFolder();
        if (!active) {
            this.folderState.resetToDriveRoot();
            return;
        }
        this.fetchChildrenInPlace(active.id);
    }

    goBack(): void {
        if (this.folderState.isAtDriveRoot()) {
            this.folderState.exitToDriveList();
            return;
        }
        this.folderState.popPath();

        const active = this.folderState.activeFolder();
        if (!active) {
            this.folderState.resetToDriveRoot();
            return;
        }
        this.fetchChildrenInPlace(active.id);
    }


    uploadFiles(parentFolderId: string | null, files: File[]): Observable<DocumentFilePayload[]> {
        const formData = new FormData();
        if (parentFolderId) {
            formData.append('parentFolderId', parentFolderId);
        }
        files.forEach((file) => formData.append('files', file, file.name));

        this.folderState.setLoading(true);

        return this.http
            .post<DocumentFilePayload[]>(endpoints.documentManagment.uploadFile, formData, { withCredentials: true })
            .pipe(
                catchError((err: HttpErrorResponse) => {
                    console.error(this.resolveError(err));
                    throw err;
                }),
                finalize(() => this.folderState.setLoading(false)),
            );
    }

    createFolder(parentFolderId: string | null, name: string): Observable<FolderPayload> {
        this.folderState.setLoading(true);
        const driveId = this.folderState.activeDrive()?.id ?? null;
        const payload = { name, parentFolderId, rootDriveId: parentFolderId ? null : driveId };

        return this.http
            .post<FolderPayload>(endpoints.documentManagment.createFolder, payload, { withCredentials: true })
            .pipe(
                catchError((err: HttpErrorResponse) => { console.error(this.resolveError(err)); throw err; }),
                finalize(() => this.folderState.setLoading(false)),
            );
    }

    renameFolder(folderId: string, newName: string): Observable<FolderPayload> {
        return this.http.patch<FolderPayload>(endpoints.documentManagment.renameFolder(folderId),
            null,
            { params: { newName }, withCredentials: true }
        );
    }

    renameFile(fileId: string, newName: string): Observable<DocumentFilePayload> {

        return this.http.patch<DocumentFilePayload>(endpoints.documentManagment.renameFile(fileId), null,
            { params: { newName }, withCredentials: true });

    }


    moveFolder(folderId: string, targetFolderId: string | null): Observable<FolderPayload> {
        let params = new HttpParams();
        if (targetFolderId) params = params.set('targetFolderId', targetFolderId);
        return this.http.patch<FolderPayload>(`${endpoints.documentManagment.baseUrl}/folders/${folderId}/move`, null, { params, withCredentials: true });
    }

    moveFile(fileId: string, targetFolderId: string): Observable<DocumentFilePayload> {
        const params = new HttpParams().set('targetFolderId', targetFolderId);
        return this.http.patch<DocumentFilePayload>(`${endpoints.documentManagment.baseUrl}/files/${fileId}/move`, null, { params, withCredentials: true });
    }

    copyFolder(folderId: string, targetFolderId: string | null, newName?: string): Observable<FolderPayload> {
        let params = new HttpParams();
        if (targetFolderId) params = params.set('targetFolderId', targetFolderId);
        if (newName) params = params.set('newName', newName);
        return this.http.post<FolderPayload>(
            `${endpoints.documentManagment.baseUrl}/folders/${folderId}/copy`,
            null,
            { params, withCredentials: true }
        );
    }

    copyFile(fileId: string, targetFolderId: string, newName?: string): Observable<DocumentFilePayload> {
        let params = new HttpParams().set('targetFolderId', targetFolderId);
        if (newName) params = params.set('newName', newName);
        return this.http.post<DocumentFilePayload>(
            `${endpoints.documentManagment.baseUrl}/files/${fileId}/copy`,
            null,
            { params, withCredentials: true }
        );
    }


    deleteFile(fileId: string): Observable<DeleteResult> {
        return this.http.delete(`${endpoints.documentManagment.baseUrl}/files/${fileId}`, { withCredentials: true }).pipe(
            tap(() => {
                const removedFile = this.folderState.removeFileLocally(fileId);
                if (removedFile) this.folderState.handleAddFileInTrash(removedFile);

            }),
            map(() => ({ id: fileId, type: 'file' as const, success: true })),
            catchError(err => of({
                id: fileId,
                type: 'file' as const,
                success: false,
                error: err?.error?.message ?? err?.message ?? 'Failed to delete file'
            }))
        );
    }

    deleteFolder(folderId: string): Observable<DeleteResult> {
        return this.http.delete(`${endpoints.documentManagment.baseUrl}/folders/${folderId}`, { withCredentials: true }).pipe(
            tap(() => {
                const removedFolder = this.folderState.removeFolderLocally(folderId);
                if (removedFolder) this.folderState.handleAddFolderInTrash(removedFolder);
            }),
            map(() => ({ id: folderId, type: 'folder' as const, success: true })),
            catchError(err => of({
                id: folderId,
                type: 'folder' as const,
                success: false,
                error: err?.error?.message ?? err?.message ?? 'Failed to delete folder'
            }))
        );
    }


    deleteItems(entries: ContextMenuTarget[]): Observable<DeleteResult[]> {
        if (!entries.length) {
            return of([]);
        }

        const requests = entries.map(entry =>
            entry.type === 'folder'
                ? this.deleteFolder(entry.item.id)
                : this.deleteFile(entry.item.id)
        );

        return forkJoin(requests);
    }


    loadBinItems(): void {
        this.folderState.setBinLoading(true);

        forkJoin({
            folders: this.getBinFolders(),
            files: this.getBinFiles()
        }).subscribe({
            next: ({ folders, files }) => {
                this.folderState.setBinFolders(folders);
                this.folderState.setBinFiles(files);
                this.folderState.setBinLoading(false);
            },
            error: (err) => {
                console.error('Failed to load bin items:', err);
                this.folderState.setBinLoading(false);
            }
        });
    }


    getBinFolders(): Observable<FolderPayload[]> {
        return this.http.get<FolderPayload[]>(`${endpoints.documentManagment.baseUrl}/bin/folders`, { withCredentials: true });
    }

    getBinFiles(): Observable<DocumentFilePayload[]> {
        return this.http.get<DocumentFilePayload[]>(`${endpoints.documentManagment.baseUrl}/bin/files`, { withCredentials: true });
    }


    restoreFolder(folderId: string): Observable<FolderPayload> {
        return this.http.put<FolderPayload>(
            `${endpoints.documentManagment.baseUrl}/bin/folders/${folderId}/restore`,
            null,
            { withCredentials: true }
        ).pipe(
            tap(() => this.folderState.removeBinFolderLocally(folderId))
        );
    }

    restoreFile(fileId: string): Observable<DocumentFilePayload> {
        return this.http.put<DocumentFilePayload>(
            `${endpoints.documentManagment.baseUrl}/bin/files/${fileId}/restore`,
            null,
            { withCredentials: true }
        ).pipe(
            tap(() => this.folderState.removeBinFileLocally(fileId))
        );
    }

    permanentlyDeleteFolder(folderId: string): Observable<void> {
        return this.http.delete<void>(`${endpoints.documentManagment.baseUrl}/bin/folders/${folderId}`, { withCredentials: true }).pipe(
            tap(() => this.folderState.removeBinFolderLocally(folderId))
        );
    }

    permanentlyDeleteFile(fileId: string): Observable<void> {
        return this.http.delete<void>(`${endpoints.documentManagment.baseUrl}/bin/files/${fileId}`, { withCredentials: true }).pipe(
            tap(() => this.folderState.removeBinFileLocally(fileId))
        );
    }

    emptyOutRecycleBin() {
        return this.http.delete<void>(`${endpoints.documentManagment.baseUrl}/bin/empty-bin`, { withCredentials: true });
    }



    private fetchChildrenInPlace(parentFolderId: string, options?: { bypassCache?: boolean }): void {
        if (!options?.bypassCache && this.folderState.hasCachedChildren(parentFolderId)) {
            this.folderState.setCurrentContents(
                this.folderState.getCachedChildren(parentFolderId),
                this.folderState.getCachedFiles(parentFolderId),
            );
            return;
        }

        this.folderState.setLoading(true);

        this.http
            .get<FolderContentsResponse>(endpoints.documentManagment.children(parentFolderId), { withCredentials: true })
            .pipe(
                tap((res) => {
                    this.folderState.setCurrentContents(res.folders, res.files);
                    this.folderState.cacheChildren(parentFolderId, res.folders);
                    this.folderState.cacheFiles(parentFolderId, res.files);
                }),
                catchError((err: HttpErrorResponse) => {
                    console.error(this.resolveError(err));
                    return of([]);
                }),
                finalize(() => this.folderState.setLoading(false)),
            )
            .subscribe();
    }

    private resolveError(err: HttpErrorResponse): string {
        if (err.status === 404) return 'Folder not found.';
        if (err.status === 0) return 'Cannot reach the server.';
        return err.error?.message ?? 'An unexpected error occurred.';
    }
}



// private refreshCurrentFolder(parentFolderId: string | null): void {
//     if (!parentFolderId) {
//         this.loadRootFolders().subscribe();
//         return;
//     }
//     this.fetchChildrenInPlace(parentFolderId, { bypassCache: true });
// }