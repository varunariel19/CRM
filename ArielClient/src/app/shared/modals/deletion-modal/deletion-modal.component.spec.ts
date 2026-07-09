import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletionModalComponent } from './deletion-modal.component';

describe('DeletionModalComponent', () => {
  let component: DeletionModalComponent;
  let fixture: ComponentFixture<DeletionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletionModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeletionModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
