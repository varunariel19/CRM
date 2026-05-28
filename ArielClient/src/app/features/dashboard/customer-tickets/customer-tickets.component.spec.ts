import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerTicketsComponent } from './customer-tickets.component';

describe('CustomerTicketsComponent', () => {
  let component: CustomerTicketsComponent;
  let fixture: ComponentFixture<CustomerTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerTicketsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerTicketsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
