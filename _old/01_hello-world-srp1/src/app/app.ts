import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { COLOR_SYNC_STATUS_LABELS } from './features/color/color-sync-status.labels';
import { ColorSelectors } from './features/color/store/color.reducer';
import { TogglePageActions } from './features/toggle/store/toggle.actions';
import { ToggleSelectors } from './features/toggle/store/toggle.reducer';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly store = inject(Store);

  readonly isOn = this.store.selectSignal(ToggleSelectors.selectIsOn);
  readonly color = this.store.selectSignal(ColorSelectors.selectBackgroundColor);
  readonly syncStatus = this.store.selectSignal(ColorSelectors.selectSyncStatus);
  readonly isSyncing = this.store.selectSignal(ColorSelectors.selectIsSyncing);
  readonly buttonLabel = computed(() => (this.isOn() ? 'OFF にする' : 'ON にする'));
  readonly stateLabel = computed(() => (this.isOn() ? 'ON' : 'OFF'));
  readonly syncStatusLabel = computed(() => COLOR_SYNC_STATUS_LABELS[this.syncStatus()]);

  toggle(): void {
    this.store.dispatch(TogglePageActions.buttonClicked());
  }
}
