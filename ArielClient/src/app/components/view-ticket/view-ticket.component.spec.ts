import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTicketComponent } from './view-ticket.component';

describe('ViewTicketComponent', () => {
  let component: ViewTicketComponent;
  let fixture: ComponentFixture<ViewTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTicketComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTicketComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
