import { ChangeDetectionStrategy, Component, model } from '@angular/core';
@Component({
  selector: 'app-sample-07-stepper',
  template:
    '<button type="button" (click)="decrement()">子 -1</button> <button type="button" (click)="increment()">子 +1</button>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample07Stepper {
  readonly count = model.required<number>();
  increment(): void {
    this.count.update((value) => value + 1);
  }
  decrement(): void {
    this.count.update((value) => value - 1);
  }
}
