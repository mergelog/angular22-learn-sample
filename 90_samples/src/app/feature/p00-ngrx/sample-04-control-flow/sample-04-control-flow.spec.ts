import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sample04ControlFlow } from './sample-04-control-flow';

describe('Sample04ControlFlow', () => {
  let component: Sample04ControlFlow;
  let fixture: ComponentFixture<Sample04ControlFlow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sample04ControlFlow],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sample04ControlFlow);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('does not create conditional or repeated children initially', () => {
    expect(component.flowChildCount()).toBe(0);
    expect(component.deferredChild()).toBeUndefined();
  });

  it('creates and destroys the @if child with its condition', () => {
    component.toggleDetail();
    fixture.detectChanges();

    expect(component.flowChildCount()).toBe(1);

    component.toggleDetail();
    fixture.detectChanges();

    expect(component.flowChildCount()).toBe(0);
    expect(component.lifecycleLog()[0]).toBe('破棄: @if で表示された詳細');
  });

  it('creates one child for each @for item', () => {
    component.addTask();
    component.addTask();
    fixture.detectChanges();

    expect(component.flowChildCount()).toBe(2);

    component.removeLastTask();
    fixture.detectChanges();

    expect(component.flowChildCount()).toBe(1);
    expect(component.lifecycleLog()[0]).toBe('破棄: タスク 2');
  });
});
