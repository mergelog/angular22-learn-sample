import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Newc } from './newc';

describe('Newc', () => {
  let component: Newc;
  let fixture: ComponentFixture<Newc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Newc],
    }).compileComponents();

    fixture = TestBed.createComponent(Newc);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
