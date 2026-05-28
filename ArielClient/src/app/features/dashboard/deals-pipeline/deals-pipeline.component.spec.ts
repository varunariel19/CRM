import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealsPipelineComponent } from './deals-pipeline.component';

describe('DealsPipelineComponent', () => {
  let component: DealsPipelineComponent;
  let fixture: ComponentFixture<DealsPipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealsPipelineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DealsPipelineComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
