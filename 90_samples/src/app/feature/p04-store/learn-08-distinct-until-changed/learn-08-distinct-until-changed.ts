import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, Subject } from 'rxjs';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';

@Component({
  selector: 'app-learn-08-distinct-until-changed',
  imports: [P04StoreNavi],
  templateUrl: './learn-08-distinct-until-changed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn08DistinctUntilChanged {
  private readonly values$ = new Subject<string>();

  readonly sentValues = signal<string[]>([]);
  readonly receivedValues = signal<string[]>([]);

  constructor() {
    this.values$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((value) => this.receivedValues.update((values) => [...values, value]));
  }

  send(value: string): void {
    this.sentValues.update((values) => [...values, value]);
    this.values$.next(value);
  }
}
