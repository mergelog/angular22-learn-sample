import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  ProcessingActions,
  userClickedSecondToggleButton,
} from './features/processing/store/processing.actions';
import {
  selectIsProcessing,
  selectIsSecondProcessing,
  selectIsThirdProcessing,
} from './features/processing/store/processing.selectors';

// アクション定義の 3 通りの書き方（A / B / C）の比較。
// それぞれの違いと大規模案件での選び方は processing.actions.ts の冒頭コメントを参照。
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly store = inject(Store);

  // A: createActionGroup / スペース区切りのイベント名
  readonly isProcessing = this.store.selectSignal(selectIsProcessing);
  readonly statusLabel = computed(() => (this.isProcessing() ? 'Processing' : 'Stop'));
  readonly toggleLabel = computed(() =>
    this.isProcessing() ? 'Stop processing' : 'Start processing',
  );

  // B: createAction
  readonly isSecondProcessing = this.store.selectSignal(selectIsSecondProcessing);
  readonly secondStatusLabel = computed(() => (this.isSecondProcessing() ? 'Processing' : 'Stop'));
  readonly secondToggleLabel = computed(() =>
    this.isSecondProcessing() ? 'Stop processing' : 'Start processing',
  );

  // C: createActionGroup / 1 語のイベント名
  readonly isThirdProcessing = this.store.selectSignal(selectIsThirdProcessing);
  readonly thirdStatusLabel = computed(() => (this.isThirdProcessing() ? 'Processing' : 'Stop'));
  readonly thirdToggleLabel = computed(() =>
    this.isThirdProcessing() ? 'Stop processing' : 'Start processing',
  );

  // isProcessing 等は selectSignal 由来の読み取り専用 signal なので、
  // 値を変えられるのは dispatch -> reducer の経路だけ
  toggleProcessing(): void {
    // A
    this.store.dispatch(ProcessingActions.userClickedToggleButton());
  }

  toggleSecondProcessing(): void {
    // B
    this.store.dispatch(userClickedSecondToggleButton());
  }

  toggleThirdProcessing(): void {
    // C
    this.store.dispatch(ProcessingActions.toggle());
  }
}
