import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StandardNoticeCard } from '../standard-notice-card/standard-notice-card';

@Component({
  selector: 'app-sample-07-extended-notice-card',
  templateUrl: './extended-notice-card.html',
  styleUrl: './extended-notice-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// [■観点:extended] BaseNoticeCard → StandardNoticeCard → ExtendedNoticeCard と機能を重ねる。
export class ExtendedNoticeCard extends StandardNoticeCard {
  // [■観点:override] 親の実装を、この拡張版用の実装へ差し替える。
  override readonly cardType: string = '拡張カード';
  override readonly accentColor: string = '#7b1fa2';

  override details(): string {
    return `${super.details()} さらに拡張カード固有の操作も利用できます。`;
  }
}
