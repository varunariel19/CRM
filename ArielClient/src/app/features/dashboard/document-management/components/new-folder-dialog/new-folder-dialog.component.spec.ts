import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFolderDialogComponent } from './new-folder-dialog.component';

describe('NewFolderDialogComponent', () => {
  let component: NewFolderDialogComponent;
  let fixture: ComponentFixture<NewFolderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewFolderDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewFolderDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
