import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InnerA } from './inner-a';

describe('InnerA', () => {
  let component: InnerA;
  let fixture: ComponentFixture<InnerA>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InnerA],
    }).compileComponents();

    fixture = TestBed.createComponent(InnerA);
    fixture.componentRef.setInput('message', 'テストメッセージ');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('increments the model value', () => {
    component.increment();

    expect(component.count()).toBe(1);
  });
});
