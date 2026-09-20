import {
  createActionGroup,
  createFeatureSelector,
  createReducer,
  createSelector,
  emptyProps,
  on,
} from '@ngrx/store'

// model
export interface P00EvoState {
  currentTemperature: number
  targetTemperature: number
  isAirConditionerOn: boolean
}

// initial
const initialState: P00EvoState = {
  currentTemperature: 24,
  targetTemperature: 26,
  isAirConditionerOn: false,
}

// action
export const p00EvoActions = createActionGroup({
  source: 'P00 Evo',
  events: {
    'Target Temperature Increased': emptyProps(),
    'Target Temperature Decreased': emptyProps(),
    'Air Conditioner Toggled': emptyProps(),
  }
})

// reducer
export const p00EvoReducer = createReducer(
  initialState,

  on(
    p00EvoActions.targetTemperatureIncreased,
    state => ({
      ...state,
      targetTemperature: state.targetTemperature + 1,
    })
  ),

  on(
    p00EvoActions.targetTemperatureDecreased,
    state => ({
      ...state,
      targetTemperature: state.targetTemperature - 1,
    })
  ),

  on(
    p00EvoActions.airConditionerToggled,
    state => ({
      ...state,
      isAirConditionerOn: !state.isAirConditionerOn,
    })
  )
)

// selector
export const P00_EVO_FEATURE_KEY = 'p00Evo'

const selectP00EvoState = createFeatureSelector<P00EvoState>(
  P00_EVO_FEATURE_KEY
)

export const p00EvoSelectors = {
  currentTemperature: createSelector(
    selectP00EvoState,
    state => state.currentTemperature
  ),

  targetTemperature: createSelector(
    selectP00EvoState,
    state => state.targetTemperature
  ),

  isAirConditionerOn: createSelector(
    selectP00EvoState,
    state => state.isAirConditionerOn
  ),
}
