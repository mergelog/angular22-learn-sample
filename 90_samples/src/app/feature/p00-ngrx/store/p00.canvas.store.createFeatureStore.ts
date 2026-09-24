import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  createActionGroup,
  createFeatureSelector,
  createReducer,
  createSelector,
  emptyProps,
  on,
  props,
} from '@ngrx/store';
import { map, switchMap, timer } from 'rxjs';

// model
export interface P00CanvasManualState {
  name: string;
  num: number;
  status: string;
}

export const P00_CANVAS_MANUAL_FEATURE_KEY = 'p00CanvasManual';

// initial
export const initialP00CanvasManualState: P00CanvasManualState = {
  name: '-',
  num: 0,
  status: 'stand-by',
};

// action
export const p00CanvasManualActions = createActionGroup({
  source: 'P00 Canvas Manual',
  events: {
    setter: props<P00CanvasManualState>(),
    changeName: props<{ name: string }>(),
    changeNum: props<{ name: string; num: number }>(),
    changeStatusToStandBy: emptyProps(),
  },
});

// reducer
export const p00CanvasManualReducer = createReducer(
  initialP00CanvasManualState,
  on(p00CanvasManualActions.setter, (state, { name, num }) => ({
    ...state,
    name,
    num,
  })),
  on(p00CanvasManualActions.changeName, (state, { name }) => ({
    ...state,
    name,
    status: 'updated .. view 1s',
  })),
  on(p00CanvasManualActions.changeNum, (state, { num }) => ({
    ...state,
    num,
  })),
  on(p00CanvasManualActions.changeStatusToStandBy, (state) => ({
    ...state,
    status: 'stand-by',
  })),
);

// selector
const selectP00CanvasManualState = createFeatureSelector<P00CanvasManualState>(
  P00_CANVAS_MANUAL_FEATURE_KEY,
);

export const p00CanvasManualSelectors = {
  name: createSelector(selectP00CanvasManualState, (state) => state.name),
  num: createSelector(selectP00CanvasManualState, (state) => state.num),
  status: createSelector(selectP00CanvasManualState, (state) => state.status),
};

// effect
export const changeManualNameStatus = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(p00CanvasManualActions.changeName),
      switchMap(() => timer(1000).pipe(map(() => p00CanvasManualActions.changeStatusToStandBy()))),
    ),
  { functional: true },
);
