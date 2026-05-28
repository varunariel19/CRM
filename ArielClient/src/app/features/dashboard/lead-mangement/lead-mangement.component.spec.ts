import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadMangementComponent } from './lead-mangement.component';

describe('LeadMangementComponent', () => {
  let component: LeadMangementComponent;
  let fixture: ComponentFixture<LeadMangementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadMangementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LeadMangementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
