import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFollowUpComponent } from './task-follow-up.component';

describe('TaskFollowUpComponent', () => {
  let component: TaskFollowUpComponent;
  let fixture: ComponentFixture<TaskFollowUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFollowUpComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFollowUpComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
