import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { endpoints } from '../core/constants/endpoints';
import { DocumentFilePayload, FolderPayload, FolderState } from '../state/document-mangement.state';

@Injectable({ providedIn: 'root' })
export class FolderService {

    constructor(
        private http: HttpClient,
        private folderState: FolderState,
    ) { }

    loadRootFolders(): Observable<FolderPayload[]> {
        this.folderState.setLoading(true);

        return this.http
            .get<FolderPayload[]>(endpoints.folders.root, { withCredentials: true })
            .pipe(
                tap((folders) => this.folderState.setRootFolders(folders)),
                catchError((err: HttpErrorResponse) => {
                    console.error(this.resolveError(err));
                    return of([]);
                }),
                finalize(() => this.folderState.setLoading(false)),
            );
    }

    openFolder(folder: FolderPayload): Observable<FolderPayload[]> {
        if (this.folderState.hasCachedChildren(folder.id)) {
            const cached = this.folderState.getCachedChildren(folder.id);
            this.folderState.pushPath(folder);
            this.folderState.setCurrentFolders(cached);
            return of(cached);
        }

        this.folderState.setLoading(true);

        return this.http
            .get<FolderPayload[]>(endpoints.folders.children(folder.id), { withCredentials: true })
            .pipe(
                tap((children) => {
                    this.folderState.pushPath(folder);
                    this.folderState.setCurrentFolders(children);
                    this.folderState.cacheChildren(folder.id, children);
                }),
                catchError((err: HttpErrorResponse) => {
                    console.error(this.resolveError(err));
                    return of([]);
                }),
                finalize(() => this.folderState.setLoading(false)),
            );
    }

    goToBreadcrumb(index: number): void {
        this.folderState.goToPathIndex(index);

        const active = this.folderState.activeFolder();
        if (!active) {
            this.folderState.setCurrentFolders(this.folderState.rootFolders());
            return;
        }

        this.fetchChildrenInPlace(active.id);
    }

    goBack(): void {
        this.folderState.popPath();

        const active = this.folderState.activeFolder();
        if (!active) {
            this.folderState.setCurrentFolders(this.folderState.rootFolders());
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
            .post<DocumentFilePayload[]>(endpoints.folders.uploadFile, formData, { withCredentials: true })
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

        const payload = { name, parentFolderId };

        return this.http
            .post<FolderPayload>(endpoints.folders.createFolder, payload, { withCredentials: true })
            .pipe(
                catchError((err: HttpErrorResponse) => {
                    console.error(this.resolveError(err));
                    throw err;
                }),
                finalize(() => this.folderState.setLoading(false)),
            );
    }

    private refreshCurrentFolder(parentFolderId: string | null): void {
        if (!parentFolderId) {
            this.loadRootFolders().subscribe();
            return;
        }
        // bypass cache here — this runs right after an upload/create, so the
        // list must reflect the server's latest state, not a stale cache entry
        this.fetchChildrenInPlace(parentFolderId, { bypassCache: true });
    }

    private fetchChildrenInPlace(parentFolderId: string, options?: { bypassCache?: boolean }): void {
        if (!options?.bypassCache && this.folderState.hasCachedChildren(parentFolderId)) {
            this.folderState.setCurrentFolders(this.folderState.getCachedChildren(parentFolderId));
            return;
        }

        this.folderState.setLoading(true);

        this.http
            .get<FolderPayload[]>(endpoints.folders.children(parentFolderId), { withCredentials: true })
            .pipe(
                tap((children) => {
                    this.folderState.setCurrentFolders(children);
                    this.folderState.cacheChildren(parentFolderId, children);
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