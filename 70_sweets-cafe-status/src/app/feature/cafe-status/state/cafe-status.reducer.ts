import { createReducer, on } from '@ngrx/store';

import { CafeDashboard } from '../../../core/model/cafe-status.model';
import {
  changeSplitPercent,
  loadDashboard,
  loadDashboardFailure,
  loadDashboardSuccess,
} from './cafe-status.actions';

export const CAFE_STATUS_FEATURE_KEY = 'cafeStatus';

export interface CafeStatusState {
  readonly dashboard: CafeDashboard | null;
  readonly loading: boolean;
  readonly loadError: string | null;
  readonly updatingTableNumber: string | null;
  readonly updateError: { readonly tableNumber: string; readonly message: string } | null;
  readonly splitPercent: number;
}

export const initialCafeStatusState: CafeStatusState = {
  dashboard: null,
  loading: false,
  loadError: null,
  updatingTableNumber: null,
  updateError: null,
  splitPercent: 65,
};

export const cafeStatusReducer = createReducer(
  initialCafeStatusState,
  on(loadDashboard, (state) => ({
    ...state,
    loading: true,
    loadError: null,
  })),
  on(loadDashboardSuccess, (state, { dashboard }) => ({
    ...state,
    dashboard,
    loading: false,
  })),
  on(loadDashboardFailure, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    loadError: errorMessage,
  })),
  on(changeSplitPercent, (state, { splitPercent }) => ({
    ...state,
    splitPercent,
  })),
);
