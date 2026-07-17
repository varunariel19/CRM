import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentManagementComponent } from './document-management.component';

describe('DocumentManagementComponent', () => {
  let component: DocumentManagementComponent;
  let fixture: ComponentFixture<DocumentManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
