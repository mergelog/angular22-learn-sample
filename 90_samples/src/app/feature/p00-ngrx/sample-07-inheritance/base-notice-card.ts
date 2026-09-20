import { signal } from '@angular/core';

// [■観点:継承] 共通の状態と操作を基底クラスに置く。これは単体では Component ではない。
export abstract class BaseNoticeCard {
  protected readonly isOpen = signal(false);

  abstract readonly cardType: string;
  abstract readonly accentColor: string;

  toggle(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  details(): string {
    return `${this.cardType}として共通の詳細を表示しています。`;
  }
}
