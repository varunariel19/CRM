import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, input, output, signal, computed } from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TeamAttachmentType } from '../../../core/types/teams.type';
import { PickerComponent } from "@ctrl/ngx-emoji-mart";
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, PickerComponent, FormsModule],
  templateUrl: './message-composer.component.html',
  styleUrl: './message-composer.component.scss',
})
export class ComposerComponent implements OnInit, OnDestroy {
  @ViewChild('editorEl') editorEl!: ElementRef<HTMLElement>;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  disabled = input<boolean>(false);

  onSend = output<{ content: string; attachments: PendingAttachment[]; scheduledAt?: string }>();
  scheduledFor = signal<string | null>(null);
  onTyping = output<boolean>();

  editor!: Editor;
  content = '';
  attachments: PendingAttachment[] = [];
  showEmojiPicker = signal(false);
  showToolbar = signal(false);

  showSchedulePicker = signal(false);
  showTimeDropdown = signal(false);
  scheduleDate = signal<string>('');
  scheduleTime = signal<string>('8:00 AM');

  timeSlots: string[] = [
    '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM',
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  ];

  customHour = signal<number>(8);
  customMinute = signal<number>(0);
  customMeridiem = signal<'AM' | 'PM'>('AM');
  todayDateStr = new Date().toLocaleDateString('en-CA');
  isScheduled = computed(() => !!this.scheduledFor());
  scheduledLabel = computed(() => {
    const iso = this.scheduledFor();
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  });

  scheduleError = signal<string | null>(null);

  onHourInput(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    const clamped = Math.min(12, Math.max(1, value || 1));
    this.customHour.set(clamped);
  }


  toggleSchedulePicker(): void {
    this.scheduleError.set(null);
    this.showSchedulePicker.set(!this.showSchedulePicker());
  }


  onMinuteInput(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    const clamped = Math.min(59, Math.max(0, value || 0));
    this.customMinute.set(clamped);
  }

  setMeridiem(value: 'AM' | 'PM'): void {
    this.customMeridiem.set(value);
    this.applyCustomTime(true);
  }

  applyCustomTime(openDropDown: boolean): void {
    const hour = this.customHour();
    const minute = this.customMinute().toString().padStart(2, '0');
    this.scheduleTime.set(`${hour}:${minute} ${this.customMeridiem()}`);
    this.showTimeDropdown.set(openDropDown);
  }

  private syncCustomFieldsFromScheduleTime(): void {
    const match = this.scheduleTime().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!match) return;

    const [, hourStr, minuteStr, meridiemStr] = match;
    this.customHour.set(+hourStr);
    this.customMinute.set(+minuteStr);
    this.customMeridiem.set(meridiemStr.toUpperCase() as 'AM' | 'PM');
  }

  get scheduleDateLabel(): string {
    if (!this.scheduleDate()) return 'Select a date';
    const d = new Date(this.scheduleDate());
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }





  get scheduleTimeLabel(): string {
    return this.scheduleTime();
  }

  toggleTimeDropdown(): void {
    const opening = !this.showTimeDropdown();
    this.showTimeDropdown.set(opening);
    if (opening) {
      this.syncCustomFieldsFromScheduleTime();
    }
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.scheduleDate.set(input.value);
  }

  selectTime(slot: string, event: Event): void {
    event.stopPropagation();
    this.scheduleTime.set(slot);
    this.syncCustomFieldsFromScheduleTime();
    this.showTimeDropdown.set(false);
  }

  clearSchedule(): void {
    this.scheduledFor.set(null);
  }


  confirmSchedule(): void {
    const iso = this.buildScheduledIso();
    if (!iso) return; // scheduleError is already set, popup stays open so user can fix it
    this.scheduledFor.set(iso);
    this.scheduleError.set(null);
    this.showSchedulePicker.set(false);
    this.showTimeDropdown.set(false);
  }

  private buildScheduledIso(): string | null {
    const dateStr = this.scheduleDate();
    const match = this.scheduleTime().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

    if (!dateStr) {
      this.scheduleError.set('Please pick a date');
      return null;
    }
    if (!match) {
      this.scheduleError.set('Please pick a valid time');
      return null;
    }

    const [, hourStr, minuteStr, meridiem] = match;
    let hour = +hourStr % 12;
    if (meridiem.toUpperCase() === 'PM') hour += 12;

    const [year, month, day] = dateStr.split('-').map(Number);
    const local = new Date(year, month - 1, day, hour, +minuteStr, 0, 0);

    if (local.getTime() <= Date.now()) {
      this.scheduleError.set('Please choose a time in the future');
      return null;
    }

    this.scheduleError.set(null);
    return local.toISOString();
  }


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
    this.onSend.emit({
      content: this.content,
      attachments: [...this.attachments],
      scheduledAt: this.scheduledFor() ?? undefined,
    });
    this.editor.commands.clearContent(true);
    this.content = '';
    this.attachments = [];
    this.scheduledFor.set(null);
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