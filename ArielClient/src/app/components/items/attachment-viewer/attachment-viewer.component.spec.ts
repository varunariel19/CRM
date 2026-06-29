import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentViewerComponent } from './attachment-viewer.component';

describe('AttachmentViewerComponent', () => {
  let component: AttachmentViewerComponent;
  let fixture: ComponentFixture<AttachmentViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttachmentViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AttachmentViewerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
