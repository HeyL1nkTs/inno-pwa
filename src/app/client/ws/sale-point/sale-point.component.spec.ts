import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalePointComponent } from './sale-point.component';

describe('SalePointComponent', () => {
  let component: SalePointComponent;
  let fixture: ComponentFixture<SalePointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalePointComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalePointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
