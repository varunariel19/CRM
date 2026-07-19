import { CommonModule } from '@angular/common';
import { Component, input, output, signal, computed, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TeamMessageAttachment } from '../../../core/types/teams.type';

type ViewerState = 'loading' | 'ready' | 'error' | 'fetching-text';
type PreviewKind = 'image' | 'video' | 'audio' | 'pdf' | 'office' | 'text' | 'unsupported';

const TEXT_EXTENSIONS = /\.(txt|csv|md|json|xml|yaml|yml|log|ini|env|sh|ts|tsx|js|jsx|html|htm|css|scss|less|py|java|cs|cpp|c|h|hpp|go|rs|rb|php|swift|kt|sql|bat|ps1|toml|gitignore)$/i;

const OFFICE_EXTENSIONS = /\.(docx?|xlsx?|pptx?)$/i;
const OFFICE_CONTENT_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

@Component({
  selector: 'app-attachment-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attachment-viewer.component.html',
  styleUrl: './attachment-viewer.component.scss'
})
export class AttachmentViewerComponent implements OnChanges {
  attachment = input<TeamMessageAttachment | null>(null);
  allAttachments = input<TeamMessageAttachment[]>([]);
  onClose = output<void>();

  currentIndex = signal(0);
  state = signal<ViewerState>('loading');
  textContent = signal<string | null>(null);
  safeUrl = signal<SafeResourceUrl | null>(null);

  constructor(private sanitizer: DomSanitizer) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['attachment'] && this.attachment()) {
      const all = this.allAttachments();
      const att = this.attachment()!;
      const idx = all.findIndex(a => a.id === att.id);
      this.currentIndex.set(idx >= 0 ? idx : 0);
      this.loadCurrent();
    }
  }

  current = computed(() => this.allAttachments()[this.currentIndex()] ?? this.attachment() ?? null);

  currentUrl = computed(() => this.current()?.fileUrl ?? '');
  currentFileName = computed(() => this.current()?.fileName ?? '');
  currentSize = computed(() => this.current()?.sizeBytes ?? 0);
  currentType = computed(() => this.current()?.attachmentType ?? '');

  hasPrev = computed(() => this.currentIndex() > 0);
  hasNext = computed(() => this.currentIndex() < this.allAttachments().length - 1);

  type = computed((): PreviewKind => {
    const att = this.current();
    if (!att) return 'unsupported';

    if (att.attachmentType === 'image') return 'image';
    if (att.attachmentType === 'video') return 'video';
    if (att.attachmentType === 'audio') return 'audio';

    const ct = att.contentType?.toLowerCase() ?? '';
    const name = att.fileName?.toLowerCase() ?? '';

    if (ct.startsWith('image/')) return 'image';
    if (ct.startsWith('video/')) return 'video';
    if (ct.startsWith('audio/')) return 'audio';
    if (ct === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
    if (OFFICE_CONTENT_TYPES.includes(ct) || OFFICE_EXTENSIONS.test(name)) return 'office';
    if (ct.startsWith('text/') || TEXT_EXTENSIONS.test(name)) return 'text';

    return 'unsupported';
  });

  fileIcon = computed(() => {
    const att = this.current();
    const name = att?.fileName?.toLowerCase() ?? '';
    if (name.endsWith('.pdf')) return 'fas fa-file-pdf';
    if (/\.(doc|docx)$/.test(name)) return 'fas fa-file-word';
    if (/\.(xls|xlsx)$/.test(name)) return 'fas fa-file-excel';
    if (/\.(ppt|pptx)$/.test(name)) return 'fas fa-file-powerpoint';
    if (/\.(zip|rar|7z|tar|gz)$/.test(name)) return 'fas fa-file-zipper';
    if (att?.attachmentType === 'audio') return 'fas fa-file-audio';
    if (att?.attachmentType === 'document') return 'fas fa-file-lines';
    return 'fas fa-file';
  });

  private loadCurrent() {
    this.state.set('loading');
    this.textContent.set(null);
    this.safeUrl.set(null);

    const att = this.current();
    if (!att?.fileUrl) { this.state.set('error'); return; }

    const t = this.type();

    if (t === 'image' || t === 'video' || t === 'audio' || t === 'pdf') {
      this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(att.fileUrl));
      this.state.set('ready');
      return;
    }

    if (t === 'office') {
      // Office Online Viewer needs a publicly reachable, non-expiring URL.
      // If fileUrl is behind auth or is a short-lived signed URL, this will fail to load.
      const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(att.fileUrl)}`;
      this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl));
      this.state.set('ready');
      return;
    }

    if (t === 'text') {
      this.state.set('fetching-text');
      fetch(att.fileUrl)
        .then(r => {
          if (!r.ok) throw new Error('Failed to fetch');
          return r.text();
        })
        .then(text => {
          this.textContent.set(text);
          this.state.set('ready');
        })
        .catch(() => this.state.set('error'));
      return;
    }

    // 'unsupported' — no preview, just show the download-only state
    this.state.set('ready');
  }

  prev() {
    if (this.hasPrev()) {
      this.currentIndex.update(i => i - 1);
      this.loadCurrent();
    }
  }

  next() {
    if (this.hasNext()) {
      this.currentIndex.update(i => i + 1);
      this.loadCurrent();
    }
  }

  goTo(i: number) {
    this.currentIndex.set(i);
    this.loadCurrent();
  }

  close() { this.onClose.emit(); }

  download() {
    const att = this.current();
    if (!att?.fileUrl) return;
    const a = document.createElement('a');
    a.href = att.fileUrl;
    a.download = att.fileName;
    a.target = '_blank';
    a.click();
  }

  onImageLoad() { this.state.set('ready'); }
  onImageError() { this.state.set('error'); }

  onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('viewer-backdrop')) this.close();
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') this.close();
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  copyText() {
    const text = this.textContent();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copyLabel.set('Copied!');
      setTimeout(() => this.copyLabel.set('Copy'), 2000);
    });
  }

  copyLabel = signal('Copy');
}