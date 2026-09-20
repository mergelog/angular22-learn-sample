import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseNoticeCard } from '../base-notice-card';

@Component({
  selector: 'app-sample-07-standard-notice-card',
  templateUrl: './standard-notice-card.html',
  styleUrl: './standard-notice-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandardNoticeCard extends BaseNoticeCard {
  // [■観点:override] 基底クラスの abstract メンバーを、この実体の値で実装する。
  override readonly cardType: string = '標準カード';
  override readonly accentColor: string = '#1976d2';
}
