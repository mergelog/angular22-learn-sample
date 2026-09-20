import { createFeatureSelector, createSelector } from '@ngrx/store';

import { CAFE_STATUS_FEATURE_KEY, CafeStatusState } from './cafe-status.reducer';

export const selectCafeStatusState =
  createFeatureSelector<CafeStatusState>(CAFE_STATUS_FEATURE_KEY);

export const selectDashboard = createSelector(selectCafeStatusState, (state) => state.dashboard);
export const selectLoading = createSelector(selectCafeStatusState, (state) => state.loading);
export const selectLoadError = createSelector(selectCafeStatusState, (state) => state.loadError);
export const selectUpdatingTableNumber = createSelector(
  selectCafeStatusState,
  (state) => state.updatingTableNumber,
);
export const selectUpdateError = createSelector(
  selectCafeStatusState,
  (state) => state.updateError,
);
export const selectSplitPercent = createSelector(
  selectCafeStatusState,
  (state) => state.splitPercent,
);
