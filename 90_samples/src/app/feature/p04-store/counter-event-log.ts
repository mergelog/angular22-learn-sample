import { signal } from '@angular/core';

export class CounterEventLog {
  readonly messages = signal<string[]>([]);

  record(payload: number, count: number): void {
    this.messages.update((messages) => [...messages, `受信: +${payload} / 合計: ${count}`]);
  }
}
