import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Subject, withLatestFrom } from 'rxjs';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';

@Component({
  selector: 'app-learn-02-with-latest-from',
  imports: [AsyncPipe, P04StoreNavi],
  templateUrl: './learn-02-with-latest-from.html',
  styleUrl: './learn-02-with-latest-from.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn02WithLatestFrom {
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderClick$ = new Subject<void>();
  readonly selectedDrink$ = new BehaviorSubject('コーヒー');
  readonly orderResult = signal('まだ注文していません');

  constructor() {
    this.orderClick$
      .pipe(withLatestFrom(this.selectedDrink$), takeUntilDestroyed(this.destroyRef))
      .subscribe(([, drink]) => this.orderResult.set(`${drink}を注文しました`));
  }

  selectDrink(drink: string): void {
    this.selectedDrink$.next(drink);
  }

  order(): void {
    this.orderClick$.next();
  }
}
