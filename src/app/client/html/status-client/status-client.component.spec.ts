import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusClientComponent } from './status-client.component';

describe('StatusClientComponent', () => {
  let component: StatusClientComponent;
  let fixture: ComponentFixture<StatusClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
