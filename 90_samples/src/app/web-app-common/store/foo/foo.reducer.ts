import { createFeature, createReducer, on } from '@ngrx/store';

import type { Foo } from './foo.model';
import { FooActions } from './foo.actions';

export interface FooState {
  items: readonly Foo[];
  loading: boolean;
  error: string | null;
}

export const initialFooState: FooState = {
  items: [],
  loading: false,
  error: null,
};

export const fooFeature = createFeature({
  name: 'foo',
  reducer: createReducer(
    initialFooState,
    on(FooActions.loadRequested, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(FooActions.loadSucceeded, (state, { items }) => ({
      ...state,
      items,
      loading: false,
      error: null,
    })),
    on(FooActions.loadFailed, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
  ),
});
