import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerProfilesComponent } from './customer-profiles.component';

describe('CustomerProfilesComponent', () => {
  let component: CustomerProfilesComponent;
  let fixture: ComponentFixture<CustomerProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerProfilesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerProfilesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
