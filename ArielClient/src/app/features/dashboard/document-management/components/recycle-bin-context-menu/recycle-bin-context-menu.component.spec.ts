import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecycleBinContextMenuComponent } from './recycle-bin-context-menu.component';

describe('RecycleBinContextMenuComponent', () => {
  let component: RecycleBinContextMenuComponent;
  let fixture: ComponentFixture<RecycleBinContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecycleBinContextMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecycleBinContextMenuComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
