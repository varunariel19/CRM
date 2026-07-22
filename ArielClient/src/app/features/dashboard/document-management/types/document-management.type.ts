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
  folderCount: number;
  fileCount: number;
  folderSize: number;        
  sizeOnDisk?: number;      
  parentPath?: string;
  location?: string;         
  updatedAt?: string;
  permissionsLabel?: string;
  readOnly?: boolean;
  hidden?: boolean;
};

export type FileProps = DocumentFilePayload & {
  fileTypeLabel?: string;
  sizeLabel?: string;
  sizeOnDiskLabel?: string;
  parentPath?: string;
  location?: string;
  accessedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  permissionsLabel?: string;
  readOnly?: boolean;
  hidden?: boolean;
};

export type EntryKind = 'folder' | 'file';