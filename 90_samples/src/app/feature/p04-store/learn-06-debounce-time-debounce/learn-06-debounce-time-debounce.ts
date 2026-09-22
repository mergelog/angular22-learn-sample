import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounce, debounceTime, Subject, timer } from 'rxjs';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';

@Component({
  selector: 'app-learn-06-debounce-time-debounce',
  imports: [P04StoreNavi],
  templateUrl: './learn-06-debounce-time-debounce.html',
  styleUrl: './learn-06-debounce-time-debounce.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn06DebounceTimeDebounce {
  private readonly destroyRef = inject(DestroyRef);
  private readonly inputValue$ = new Subject<string>();

  readonly debounceTimeResult = signal('未確定');
  readonly debounceResult = signal('未確定');
  readonly debounceWait = signal(1000);

  constructor() {
    this.inputValue$
      .pipe(
        debounceTime(500),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(
        (value) => this.debounceTimeResult.set(value)
      );

    this.inputValue$
      .pipe(
        debounce((value) => timer(this.waitTime(value))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => this.debounceResult.set(value));
  }

  input(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.debounceWait.set(this.waitTime(value));
    this.inputValue$.next(value);
  }

  private waitTime(value: string): number {
    return value.length >= 4 ? 300 : 1000;
  }
}
