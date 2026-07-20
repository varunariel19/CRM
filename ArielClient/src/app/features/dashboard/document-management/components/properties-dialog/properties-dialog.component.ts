import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Presentational "Properties" panel, shared by the main grid and the
 * recycle bin. Takes fully-derived display strings as inputs so it has
 * no knowledge of FolderPayload/DocumentFilePayload shapes.
 */
@Component({
  selector: 'app-properties-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './properties-dialog.component.html',
  styleUrls: ['./properties-dialog.component.scss' ,'../../document-management.component.scss'],
})
export class PropertiesDialogComponent {
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

  @Output() close = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<void>();
  @Output() editIcon = new EventEmitter<void>();
  @Output() openParent = new EventEmitter<void>();
  @Output() openPermissions = new EventEmitter<void>();
}