import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { Foo } from './foo.model';

export const FooActions = createActionGroup({
  source: 'Foo',
  events: {
    'Polling Started': emptyProps(),
    'Polling Stopped': emptyProps(),
    'Load Requested': emptyProps(),
    'Load Succeeded': props<{ items: readonly Foo[] }>(),
    'Load Failed': props<{ error: string }>(),
  },
});
