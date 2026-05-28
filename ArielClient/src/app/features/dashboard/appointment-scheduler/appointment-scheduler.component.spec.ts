import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentSchedulerComponent } from './appointment-scheduler.component';

describe('AppointmentSchedulerComponent', () => {
  let component: AppointmentSchedulerComponent;
  let fixture: ComponentFixture<AppointmentSchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentSchedulerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentSchedulerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
