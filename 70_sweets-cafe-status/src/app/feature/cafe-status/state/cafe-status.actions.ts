import { createAction, props } from '@ngrx/store';

import { CafeDashboard } from '../../../core/model/cafe-status.model';

export const CAFE_STATUS_ACTION_SOURCE = 'Cafe Status';

export const loadDashboard = createAction(`[${CAFE_STATUS_ACTION_SOURCE}] Load Dashboard`);

export const loadDashboardSuccess = createAction(
  `[${CAFE_STATUS_ACTION_SOURCE}] Load Dashboard Success`,
  props<{ readonly dashboard: CafeDashboard }>(),
);

export const loadDashboardFailure = createAction(
  `[${CAFE_STATUS_ACTION_SOURCE}] Load Dashboard Failure`,
  props<{ readonly errorMessage: string }>(),
);

export const changeSplitPercent = createAction(
  `[${CAFE_STATUS_ACTION_SOURCE}] Change Split Percent`,
  props<{ readonly splitPercent: number }>(),
);
