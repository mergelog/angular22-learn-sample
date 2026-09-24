import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  p00CanvasManualActions,
  p00CanvasManualSelectors,
} from '../../p00-ngrx/store/p00.canvas.store.createFeatureStore';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';

@Component({
  selector: 'app-learn-12-create-feature-selector',
  imports: [P04StoreNavi],
  templateUrl: './learn-12-create-feature-selector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn12CreateFeatureSelector {
  private readonly store = inject(Store);

  readonly name = this.store.selectSignal(p00CanvasManualSelectors.name);
  readonly num = this.store.selectSignal(p00CanvasManualSelectors.num);
  readonly status = this.store.selectSignal(p00CanvasManualSelectors.status);

  changeName(name: string): void {
    this.store.dispatch(p00CanvasManualActions.changeName({ name }));
  }

  incrementNum(): void {
    this.store.dispatch(
      p00CanvasManualActions.changeNum({ name: this.name(), num: this.num() + 1 }),
    );
  }
}
