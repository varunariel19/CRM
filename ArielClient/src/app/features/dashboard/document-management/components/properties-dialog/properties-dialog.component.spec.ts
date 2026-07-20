import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertiesDialogComponent } from './properties-dialog.component';


describe('PropertiesDilogComponent', () => {
  let component: PropertiesDialogComponent;
  let fixture: ComponentFixture<PropertiesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertiesDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
