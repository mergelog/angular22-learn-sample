import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BSample } from './b-sample';

describe('BSample', () => {
  let component: BSample;
  let fixture: ComponentFixture<BSample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BSample],
    }).compileComponents();

    fixture = TestBed.createComponent(BSample);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
