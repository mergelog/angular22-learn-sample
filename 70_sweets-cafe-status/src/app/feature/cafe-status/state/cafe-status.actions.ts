import { createAction } from '@ngrx/store';

export const CAFE_STATUS_ACTION_SOURCE = 'Cafe Status';

export const loadDashboard = createAction(`[${CAFE_STATUS_ACTION_SOURCE}] Load Dashboard`);
