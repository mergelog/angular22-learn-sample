import { createSelector } from '@ngrx/store';

import { dashboardFeature } from './dashboard.reducer';

const selectViewModel = createSelector(
  dashboardFeature.selectItems,
  dashboardFeature.selectLoading,
  dashboardFeature.selectError,
  (items, loading, error) => ({
    items,
    loading,
    error,
  }),
);

export const DashboardSelectors = {
  selectItems: dashboardFeature.selectItems, // 既にselector
  selectLoading: dashboardFeature.selectLoading, // 既にselector
  selectError: dashboardFeature.selectError, // 既にselector
  selectViewModel, // 上のcreateSelectorで 
};
