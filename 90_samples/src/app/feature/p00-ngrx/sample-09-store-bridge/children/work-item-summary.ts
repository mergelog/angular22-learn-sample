import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { storeBridgeActions, storeBridgeSelectors } from '../store/store-bridge.store';

@Component({
  selector: 'app-sample-09-work-item-summary',
  templateUrl: './work-item-summary.html',
  styleUrl: './work-item-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkItemSummary {
  private readonly store = inject(Store);

  // [■観点:selectSignal] 子 A とは親子関係に頼らず、同じ Store の状態を読む。
  readonly selectedItem = this.store.selectSignal(storeBridgeSelectors.selectedItem);

  clear(): void {
    this.store.dispatch(storeBridgeActions.selectionCleared());
  }
}
