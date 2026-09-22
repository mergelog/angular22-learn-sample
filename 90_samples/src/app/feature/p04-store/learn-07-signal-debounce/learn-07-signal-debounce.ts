import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';

@Component({
  selector: 'app-learn-07-signal-debounce',
  imports: [P04StoreNavi],
  templateUrl: './learn-07-signal-debounce.html',
  styleUrl: './learn-07-signal-debounce.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn07SignalDebounce {
  private readonly inputValue = signal<string | undefined>(undefined);

  readonly fixedResult = signal('未確定');
  readonly variableResult = signal('未確定');
  readonly variableWait = computed(() => {
    return (this.inputValue()?.length ?? 0) >= 4 ? 300 : 1000;
  });

  constructor() {
    effect((onCleanup) => {
      const value = this.inputValue();

      if (value === undefined) return;

      const timeoutId = setTimeout(() => this.fixedResult.set(value), 500);
      onCleanup(() => clearTimeout(timeoutId));
    });

    effect((onCleanup) => {
      const value = this.inputValue();

      if (value === undefined) return;

      const timeoutId = setTimeout(() => this.variableResult.set(value), this.variableWait());
      onCleanup(() => clearTimeout(timeoutId));
    });
  }

  input(event: Event): void {
    this.inputValue.set((event.target as HTMLInputElement).value);
  }
}
