import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const ColorActions = createActionGroup({
  source: 'Color Sync',
  events: {
    'Sync Started': emptyProps(),
    'Sync Succeeded': props<{ color: string }>(),
  },
});
