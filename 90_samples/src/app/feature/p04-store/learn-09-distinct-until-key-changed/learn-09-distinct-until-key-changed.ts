import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilKeyChanged, Subject } from 'rxjs';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';

type Item = { category: 'A' | 'B'; id: number };

@Component({
  selector: 'app-learn-09-distinct-until-key-changed',
  imports: [P04StoreNavi],
  templateUrl: './learn-09-distinct-until-key-changed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn09DistinctUntilKeyChanged {
  private readonly items$ = new Subject<Item>();

  readonly sentItems = signal<string[]>([]);
  readonly receivedItems = signal<string[]>([]);

  constructor() {
    this.items$
      .pipe(
        distinctUntilKeyChanged('category'),
        takeUntilDestroyed(),
      )
      .subscribe((item) => this.receivedItems.update((items) => [...items, this.label(item)]));
  }

  send(category: Item['category']): void {
    const item = { category, id: this.sentItems().length + 1 };

    this.sentItems.update((items) => [...items, this.label(item)]);
    this.items$.next(item);
  }

  private label(item: Item): string {
    return `${item.category}（id: ${item.id}）`;
  }
}
