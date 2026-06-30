import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, input, output, signal } from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TeamAttachmentType } from '../../../core/types/teams.type';
import { PickerComponent } from "@ctrl/ngx-emoji-mart";
export interface PendingAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: TeamAttachmentType;
  contentType: string;
  previewUrl?: string;
}

@Component({
  selector: 'app-composer',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './message-composer.component.html',
  styleUrl: './message-composer.component.scss',
})
export class ComposerComponent implements OnInit, OnDestroy {
  @ViewChild('editorEl') editorEl!: ElementRef<HTMLElement>;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  disabled = input<boolean>(false);

  onSend = output<{ content: string; attachments: PendingAttachment[] }>();
  onTyping = output<boolean>();

  editor!: Editor;
  content = '';
  attachments: PendingAttachment[] = [];
  showEmojiPicker = signal(false);
  showToolbar = signal(false);

  ngOnInit() {
    setTimeout(() => {
      this.editor = new Editor({
        element: this.editorEl.nativeElement,
        extensions: [
          StarterKit,
          Placeholder.configure({ placeholder: 'Type a message' }),
        ],
        editorProps: {
          handleKeyDown: (_, event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              this.send();
              return true;
            }
            return false;
          }
        },
        onUpdate: ({ editor }) => {
          this.content = editor.getText().trim() ? editor.getHTML() : '';
          this.onTyping.emit(this.content.length > 0);
        },
      });

      document.addEventListener('keydown', this.handleShortcut);
    });
  }

  toggleToolbar() {
    this.showToolbar.set(!this.showToolbar());
  }

  get canSend(): boolean {
    return !this.disabled() && (this.content.trim().length > 0 || this.attachments.length > 0);
  }


  onEmojiSelect(event: any) {
    this.editor.chain().focus().insertContent(event.emoji.native).run();
    this.showEmojiPicker.set(false);
  }

  send() {
    if (!this.canSend) return;
    this.onSend.emit({ content: this.content, attachments: [...this.attachments] });
    this.editor.commands.clearContent(true);
    this.content = '';
    this.attachments = [];
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const next = [...this.attachments, ...files.map(f => this.toPendingAttachment(f))].slice(0, 8);
    this.attachments.forEach(a => { if (!next.some(n => n.id === a.id)) this.revokePreview(a); });
    this.attachments = next;
    input.value = '';
  }

  removeAttachment(id: string) {
    const removed = this.attachments.find(a => a.id === id);
    if (removed) this.revokePreview(removed);
    this.attachments = this.attachments.filter(a => a.id !== id);
  }

  toggleBold() { this.editor.chain().focus().toggleBold().run(); }
  toggleItalic() { this.editor.chain().focus().toggleItalic().run(); }
  toggleStrike() { this.editor.chain().focus().toggleStrike().run(); }
  toggleCode() { this.editor.chain().focus().toggleCode().run(); }
  toggleBulletList() { this.editor.chain().focus().toggleBulletList().run(); }

  isActive(mark: string) { return this.editor?.isActive(mark) ?? false; }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  handleShortcut = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'X') {
      e.preventDefault();
      this.toggleToolbar();
    }
  };

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleShortcut);
    this.attachments.forEach(a => this.revokePreview(a));
    this.editor?.destroy();
  }

  private toPendingAttachment(file: File): PendingAttachment {
    const type = this.getAttachmentType(file);
    return {
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type,
      contentType: file.type || 'application/octet-stream',
      previewUrl: ['image', 'audio', 'video'].includes(type) ? URL.createObjectURL(file) : undefined,
    };
  }

  private getAttachmentType(file: File): TeamAttachmentType {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    if (/\.(pdf|docx?|xlsx?|pptx?|txt|csv)$/i.test(file.name)) return 'document';
    return 'file';
  }

  private revokePreview(a: PendingAttachment) {
    if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
  }
}