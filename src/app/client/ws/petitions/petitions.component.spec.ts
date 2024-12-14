import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetitionsComponent } from './petitions.component';

describe('PetitionsComponent', () => {
  let component: PetitionsComponent;
  let fixture: ComponentFixture<PetitionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetitionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
