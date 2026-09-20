import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ASample } from './a-sample';

describe('ASample', () => {
  let component: ASample;
  let fixture: ComponentFixture<ASample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASample],
    }).compileComponents();

    fixture = TestBed.createComponent(ASample);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
