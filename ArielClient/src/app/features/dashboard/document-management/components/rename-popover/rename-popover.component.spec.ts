import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenamePopoverComponent } from './rename-popover.component';

describe('RenamePopoverComponent', () => {
  let component: RenamePopoverComponent;
  let fixture: ComponentFixture<RenamePopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenamePopoverComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RenamePopoverComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
