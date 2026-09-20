import { createActionGroup, emptyProps } from '@ngrx/store';

export const TogglePageActions = createActionGroup({
  source: 'Toggle Page',
  events: {
    'Button Clicked': emptyProps(),
  },
});
