import { createFeature, createReducer, on } from '@ngrx/store';

import type { Lot } from '../data-access/dashboard.model';
import { DashboardActions } from './dashboard.actions';

/* ../data-access/dashboard.model
export interface Lot {
  lotName: string;
  waferCount: number;
  accuracy: number;
  status: 'processing';
  updatedAt: string;
}
*/

export interface DashboardState {
  items: readonly Lot[];
  loading: boolean;
  error: string | null;
}

export const initialDashboardState: DashboardState = {
  items: [],
  loading: false,
  error: null,
};

export const dashboardFeature = createFeature({ // provideState(dashboardFeature) で登録 
                                                // → dashboard.routes.ts
  name: 'dashboard',
  reducer: createReducer(
    initialDashboardState,
    on(DashboardActions.loadRequested, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(DashboardActions.loadSucceeded, (state, { items }) => ({
      ...state,
      items,
      loading: false,
      error: null,
    })),
    on(DashboardActions.loadFailed, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
  ),
});
