import { Component, inject } from '@angular/core'
import { Store } from '@ngrx/store'
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import {
  p00EvoActions,
  p00EvoSelectors,
} from '../store/p00.evo.store'

@Component({
  selector: 'app-p00-evolution',
  imports: [P00NgrxNavi],
  templateUrl: './p00-evolution.html',
  styleUrl: './p00-evolution.scss',
})
export class P00Evolution {

  private readonly store = inject(Store)

  readonly currentTemperature = this.store.selectSignal(
    p00EvoSelectors.currentTemperature
  )

  readonly targetTemperature = this.store.selectSignal(
    p00EvoSelectors.targetTemperature
  )

  readonly isAirConditionerOn = this.store.selectSignal(
    p00EvoSelectors.isAirConditionerOn
  )

  increaseTargetTemperature() {
    this.store.dispatch(
      p00EvoActions.targetTemperatureIncreased()
    )
  }

  decreaseTargetTemperature() {
    this.store.dispatch(
      p00EvoActions.targetTemperatureDecreased()
    )
  }

  toggleAirConditioner() {
    this.store.dispatch(
      p00EvoActions.airConditionerToggled()
    )
  }

}
