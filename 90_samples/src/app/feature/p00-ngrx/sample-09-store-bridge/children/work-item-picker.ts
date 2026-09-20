import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { storeBridgeActions, storeBridgeSelectors } from '../store/store-bridge.store';

@Component({
  selector: 'app-sample-09-work-item-picker',
  templateUrl: './work-item-picker.html',
  styleUrl: './work-item-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkItemPicker {
  private readonly store = inject(Store);

  readonly items = this.store.selectSignal(storeBridgeSelectors.items);
  readonly selectedItemId = this.store.selectSignal(storeBridgeSelectors.selectedItemId);

  select(itemId: number): void {
    // [■観点:dispatch] 親へ output せず、Store へ action を送る。
    this.store.dispatch(storeBridgeActions.itemSelected({ itemId }));
  }
}
