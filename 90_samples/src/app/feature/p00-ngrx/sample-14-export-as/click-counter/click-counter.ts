import { Directive, signal } from '@angular/core';

@Directive({
  selector: '[appSample14ClickCounter]',
  // [■観点:exportAs] template reference から Directive instance を名前で取得できるようにする。
  exportAs: 'clickCounter',
  host: {
    '(click)': 'recordClick()',
  },
})
export class ClickCounter {
  readonly clicks = signal(0);

  recordClick(): void {
    this.clicks.update((count) => count + 1);
  }
}
