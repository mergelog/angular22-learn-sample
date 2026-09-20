import { createAction, createFeature, createReducer, on } from '@ngrx/store';

export const increment = createAction('[Signal Comparison] Increment');

export const signalComparisonFeature = createFeature({
  name: 'signalComparison',
  reducer: createReducer(
    { count: 0 },
    on(increment, (state) => ({ count: state.count + 1 })),
  ),
});
