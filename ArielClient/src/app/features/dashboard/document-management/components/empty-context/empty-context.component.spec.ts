import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyContextComponent } from './empty-context.component';

describe('EmptyContextComponent', () => {
  let component: EmptyContextComponent;
  let fixture: ComponentFixture<EmptyContextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyContextComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyContextComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
