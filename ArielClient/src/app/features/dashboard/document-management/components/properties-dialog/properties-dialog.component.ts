import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

type PropertiesTab = 'general' | 'sharing' | 'security' | 'previous-versions' | 'customize';

@Component({
  selector: 'app-properties-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './properties-dialog.component.html',
  styleUrls: ['./properties-dialog.component.scss', '../../document-management.component.scss'],
})
export class PropertiesDialogComponent {
  // --- existing inputs, kept for backward compatibility ---
  @Input() icon = '';
  @Input() isFolder = false;
  @Input() name = '';
  @Input() subtitle = '';
  @Input() secondarySubtitle = '';
  @Input() parentPath = '';
  @Input() modified = '—';
  @Input() created = '—';
  @Input() accessed: string | null = null;
  @Input() permissionsLabel = '';
  @Input() favorite = false;

  @Input() typeLabel = '';         
  @Input() location = '';          
  @Input() sizeLabel = '';         
  @Input() sizeOnDiskLabel = '';     
  @Input() containsLabel = '';       
  @Input() readOnly = false;
  @Input() hidden = false;

  activeTab: PropertiesTab = 'general';

  // --- existing outputs, kept ---
  @Output() close = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<void>();
  @Output() editIcon = new EventEmitter<void>();
  @Output() openParent = new EventEmitter<void>();
  @Output() openPermissions = new EventEmitter<void>();

  // --- new outputs for Windows-style actions ---
  @Output() apply = new EventEmitter<void>();
  @Output() toggleReadOnly = new EventEmitter<void>();
  @Output() toggleHidden = new EventEmitter<void>();
  @Output() openAdvanced = new EventEmitter<void>();
  @Output() nameChange = new EventEmitter<string>();

  setTab(tab: PropertiesTab) {
    this.activeTab = tab;
  }

  onNameInput(value: string) {
    this.nameChange.emit(value);
  }

  onOk() {
    this.apply.emit();
    this.close.emit();
  }
}