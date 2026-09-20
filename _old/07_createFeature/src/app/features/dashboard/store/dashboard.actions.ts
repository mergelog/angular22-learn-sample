import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { Lot } from '../data-access/dashboard.model';

export const DashboardActions = createActionGroup({
  source: 'Dashboard',
  events: {
    'Polling Started': emptyProps(),
    'Polling Stopped': emptyProps(),
    'Load Requested': emptyProps(), // on(DashboardActions.loadRequested, (state) => ({
    'Load Succeeded': props<{ items: readonly Lot[] }>(), // on(DashboardActions.loadSucceeded, (state, { items }) => ({
    'Load Failed': props<{ error: string }>(), // on(DashboardActions.loadFailed, (state, { error }) => ({
  },
});
