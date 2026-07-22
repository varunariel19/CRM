import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { endpoints } from '../constants/endpoints';
import { DocumentFilePayload } from '../../state/document-mangement.state';

export type OperationVerb = 'Uploading' | 'Deleting' | 'Restoring' | 'Emptying Recycle Bin' | 'Copying' | 'Moving';

export interface OperationItem {
    id: string;
    label: string;          // file/folder name shown in the list
    sizeBytes?: number;     // present only for uploads (enables byte-weighted progress)
    progress: number;       // 0-100
    status: 'queued' | 'processing' | 'done' | 'error';
    errorMessage?: string;
}

@Injectable({ providedIn: 'root' })
export class OperationProgressService {
    uploadUrl = endpoints.documentManagment.uploadFile;

    items = signal<OperationItem[]>([]);
    verb = signal<OperationVerb>('Uploading');
    sourceLabel = signal('');
    destinationLabel = signal('');
    stopped = signal(false);
    indeterminate = signal(false); // true when we truly can't know progress (e.g. Empty Recycle Bin)

    private startedAt = 0;
    private currentAbort: (() => void) | null = null;

    constructor(private http: HttpClient) {}

    // ---------- shared helpers ----------

    private begin(verb: OperationVerb, items: OperationItem[], sourceLabel = '', destinationLabel = '', indeterminate = false) {
        this.verb.set(verb);
        this.items.set(items);
        this.sourceLabel.set(sourceLabel);
        this.destinationLabel.set(destinationLabel);
        this.stopped.set(false);
        this.indeterminate.set(indeterminate);
        this.startedAt = Date.now();
    }

    private patchItem(id: string, changes: Partial<OperationItem>) {
        this.items.update((list) => list.map((i) => (i.id === id ? { ...i, ...changes } : i)));
    }

    stop() {
        this.stopped.set(true);
        this.currentAbort?.();
    }

    clear() {
        this.items.set([]);
        this.stopped.set(false);
        this.indeterminate.set(false);
    }

    get totalWeight(): number {
        const list = this.items();
        const hasSizes = list.every((i) => i.sizeBytes !== undefined);
        return hasSizes ? list.reduce((s, i) => s + (i.sizeBytes ?? 0), 0) : list.length;
    }

    get doneWeight(): number {
        const list = this.items();
        const hasSizes = list.every((i) => i.sizeBytes !== undefined);
        return hasSizes
            ? list.reduce((s, i) => s + ((i.sizeBytes ?? 0) * i.progress) / 100, 0)
            : list.reduce((s, i) => s + i.progress / 100, 0);
    }

    get overallProgress(): number {
        if (this.indeterminate()) return 0; // dialog renders a striped animated bar instead
        const total = this.totalWeight;
        return total === 0 ? 0 : Math.round((this.doneWeight / total) * 100);
    }

    get isComplete(): boolean {
        return this.items().length > 0 && this.items().every((i) => i.status === 'done' || i.status === 'error');
    }

    get timeRemainingLabel(): string {
        if (this.indeterminate()) return 'Please wait…';
        const elapsedSec = (Date.now() - this.startedAt) / 1000;
        if (elapsedSec < 1 || this.doneWeight === 0) return 'Calculating time remaining...';

        const rate = this.doneWeight / elapsedSec;
        const remainingSec = Math.ceil((this.totalWeight - this.doneWeight) / rate);

        if (remainingSec <= 1) return 'A few seconds remaining';
        if (remainingSec < 60) return `${remainingSec} seconds remaining`;
        const minutes = Math.floor(remainingSec / 60);
        const seconds = remainingSec % 60;
        return `About ${minutes} minute${minutes === 1 ? '' : 's'} and ${seconds} second${seconds === 1 ? '' : 's'} remaining`;
    }

    private formatBytes(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
    }

    get sizeLabel(): string {
        const list = this.items();
        const hasSizes = list.every((i) => i.sizeBytes !== undefined);
        return hasSizes ? this.formatBytes(this.totalWeight) : '';
    }

    // ---------- 1. UPLOAD (real byte progress via HttpClient) ----------

    async uploadFiles(
        parentFolderId: string | null,
        files: File[],
        sourceLabel = 'your device',
        destinationLabel = 'this folder',
    ): Promise<DocumentFilePayload[]> {
        const queued: OperationItem[] = files.map((file) => ({
            id: crypto.randomUUID(),
            label: file.name,
            sizeBytes: file.size,
            progress: 0,
            status: 'queued',
        }));
        this.begin('Uploading', queued, sourceLabel, destinationLabel);

        const fileMap = new Map(files.map((f, i) => [queued[i].id, f]));
        const results: DocumentFilePayload[] = [];

        for (const item of queued) {
            if (this.stopped()) break;
            const file = fileMap.get(item.id)!;
            const uploaded = await this.uploadOne(item, file, parentFolderId);
            if (uploaded) results.push(uploaded);
        }
        return results;
    }

    private uploadOne(item: OperationItem, file: File, parentFolderId: string | null): Promise<DocumentFilePayload | null> {
        this.patchItem(item.id, { status: 'processing' });

        const formData = new FormData();
        if (parentFolderId) formData.append('parentFolderId', parentFolderId);
        formData.append('files', file, file.name);

        return new Promise((resolve) => {
            const sub = this.http
                .post<DocumentFilePayload[]>(this.uploadUrl, formData, {
                    withCredentials: true,
                    reportProgress: true,
                    observe: 'events',
                })
                .subscribe({
                    next: (event) => {
                        if (event.type === HttpEventType.UploadProgress) {
                            const pct = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
                            this.patchItem(item.id, { progress: pct });
                        } else if (event.type === HttpEventType.Response) {
                            this.patchItem(item.id, { progress: 100, status: 'done' });
                            resolve(event.body?.[0] ?? null);
                        }
                    },
                    error: (err: HttpErrorResponse) => {
                        this.patchItem(item.id, { status: 'error', errorMessage: err.error?.message ?? 'Upload failed' });
                        resolve(null);
                    },
                });
            this.currentAbort = () => sub.unsubscribe();
        });
    }

    async runPerItem(
        verb: OperationVerb,
        entries: { id: string; label: string }[],
        action: (id: string) => Promise<void>,
        sourceLabel = '',
        destinationLabel = '',
    ): Promise<void> {
        const queued: OperationItem[] = entries.map((e) => ({
            id: e.id,
            label: e.label,
            progress: 0,
            status: 'queued',
        }));
        this.begin(verb, queued, sourceLabel, destinationLabel);

        for (const item of queued) {
            if (this.stopped()) break;
            this.patchItem(item.id, { status: 'processing', progress: 50 });
            try {
                await action(item.id);
                this.patchItem(item.id, { progress: 100, status: 'done' });
            } catch (err: any) {
                this.patchItem(item.id, { status: 'error', errorMessage: err?.message ?? 'Failed' });
            }
        }
    }

    // ---------- 4. EMPTY RECYCLE BIN (single backend call — no per-item visibility) ----------

    async runSingleCall(verb: OperationVerb, label: string, action: () => Promise<void>): Promise<void> {
        const item: OperationItem = { id: crypto.randomUUID(), label, progress: 0, status: 'queued' };
        this.begin(verb, [item], '', '', /* indeterminate */ true);
        this.patchItem(item.id, { status: 'processing' });

        try {
            await action();
            this.patchItem(item.id, { progress: 100, status: 'done' });
        } catch (err: any) {
            this.patchItem(item.id, { status: 'error', errorMessage: err?.message ?? 'Failed' });
        }
    }
}