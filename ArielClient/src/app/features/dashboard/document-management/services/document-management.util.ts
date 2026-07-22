import { TeamAttachmentType, TeamMessageAttachment } from "../../../../core/types/teams.type";
import { DocumentFilePayload } from "../../../../state/document-mangement.state";


const COPY_SUFFIX_REGEX = / \(Copy(?: (\d+))?\)$/;

export function inferAttachmentType(contentType: string): TeamAttachmentType {
  const ct = contentType?.toLowerCase() ?? '';
  if (ct.startsWith('image/')) return 'image' as TeamAttachmentType;
  if (ct.startsWith('video/')) return 'video' as TeamAttachmentType;
  if (ct.startsWith('audio/')) return 'audio' as TeamAttachmentType;
  return 'document' as TeamAttachmentType;
}

export function toTeamAttachment(file: DocumentFilePayload): TeamMessageAttachment {
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

export function getFileTypeLabel(fileName: string): string {
  const ext = fileName.split('.').pop()?.toUpperCase() ?? '';
  return ext ? `${ext} document` : 'File';
}

export function entryKey(type: 'folder' | 'file', id: string): string {
  return `${type}:${id}`;
}


function splitFileName(name: string): { base: string; ext: string } {
  const lastDot = name.lastIndexOf('.');
  if (lastDot <= 0) return { base: name, ext: '' };
  return { base: name.slice(0, lastDot), ext: name.slice(lastDot) };
}

function stripCopySuffix(base: string): string {
  return base.replace(COPY_SUFFIX_REGEX, '');
}


export function generateUniqueCopyName(originalName: string, existingNames: Set<string>): string {
  const { base, ext } = splitFileName(originalName);
  const rootBase = stripCopySuffix(base);

  const firstAttempt = `${rootBase} (Copy)${ext}`;
  if (!existingNames.has(firstAttempt)) return firstAttempt;

  let n = 1;
  let candidate = `${rootBase} (Copy ${n})${ext}`;
  while (existingNames.has(candidate)) {
    n++;
    candidate = `${rootBase} (Copy ${n})${ext}`;
  }
  return candidate;
}


export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 bytes';
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  const rounded = exponent === 0 ? value : Math.round(value * 10) / 10;
  return `${rounded} ${units[exponent]} (${bytes.toLocaleString()} bytes)`;
}