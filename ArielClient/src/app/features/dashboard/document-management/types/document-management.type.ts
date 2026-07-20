import { DocumentFilePayload, FolderPayload } from "../../../../state/document-mangement.state";

export type ContextMenuTarget =
  | { type: 'folder'; item: FolderPayload }
  | { type: 'file'; item: DocumentFilePayload };

export interface ClipboardEntry {
  targets: ContextMenuTarget[];
  mode: 'cut' | 'copy';
  sourceFolderId: string | null;
}
export type BinContextMenuTarget =
  | { type: 'folder'; item: FolderPayload }
  | { type: 'file'; item: DocumentFilePayload };

export interface BinContextMenuState {
  x: number;
  y: number;
}

export type FolderProps = FolderPayload & {
  itemsCount?: number;
  totalSizeLabel?: string;
  freeSpaceLabel?: string;
  parentPath?: string;
  modifiedAt?: string;
  permissionsLabel?: string;
};

export type FileProps = DocumentFilePayload & {
  fileTypeLabel?: string;
  sizeLabel?: string;
  parentPath?: string;
  accessedAt?: string;
  modifiedAt?: string;
  createdAt?: string;
  permissionsLabel?: string;
};

export type EntryKind = 'folder' | 'file';