import { ChangeDetectionStrategy, Component, output } from '@angular/core';
@Component({
  selector: 'app-sample-06-notice',
  template: '<button type="button" (click)="notify()">子から通知</button>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample06Notice {
  readonly notified = output<string>();
  notify(): void {
    this.notified.emit('子コンポーネントからの通知');
  }
}
