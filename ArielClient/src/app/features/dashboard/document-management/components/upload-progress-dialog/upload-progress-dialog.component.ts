import { Component } from '@angular/core';
import { OperationProgressService } from '../../../../../core/services/file-upload.service';

@Component({
  selector: 'app-upload-progress-dialog',
  standalone: true,
  templateUrl: './upload-progress-dialog.component.html',
  styleUrls: ['./upload-progress-dialog.component.scss'],
})
export class OperationProgressDialogComponent {
  showDetails = false;

  constructor(public opService: OperationProgressService) {}

  toggleDetails() { this.showDetails = !this.showDetails; }
  onStop() { this.opService.stop(); }
  close() { this.opService.clear(); }
}