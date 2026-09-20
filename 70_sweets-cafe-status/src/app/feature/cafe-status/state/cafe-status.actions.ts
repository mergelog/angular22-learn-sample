import { createAction, props } from '@ngrx/store';

import {
  CafeDashboard,
  CafeTable,
  UpdateTableRequest,
} from '../../../core/model/cafe-status.model';

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

export const updateTable = createAction(
  `[${CAFE_STATUS_ACTION_SOURCE}] Update Table`,
  props<{ readonly request: UpdateTableRequest }>(),
);

export const updateTableSuccess = createAction(
  `[${CAFE_STATUS_ACTION_SOURCE}] Update Table Success`,
  props<{ readonly table: CafeTable }>(),
);

export const updateTableFailure = createAction(
  `[${CAFE_STATUS_ACTION_SOURCE}] Update Table Failure`,
  props<{ readonly tableNumber: string; readonly message: string }>(),
);

export const changeSplitPercent = createAction(
  `[${CAFE_STATUS_ACTION_SOURCE}] Change Split Percent`,
  props<{ readonly splitPercent: number }>(),
);
