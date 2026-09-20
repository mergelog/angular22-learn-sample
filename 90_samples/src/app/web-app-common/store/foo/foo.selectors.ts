import { createSelector } from '@ngrx/store';

import { fooFeature } from './foo.reducer';

const selectViewModel = createSelector(
  fooFeature.selectItems,
  fooFeature.selectLoading,
  fooFeature.selectError,
  (items, loading, error) => ({
    items,
    loading,
    error,
  }),
);

export const FooSelectors = {
  selectItems: fooFeature.selectItems,
  selectLoading: fooFeature.selectLoading,
  selectError: fooFeature.selectError,
  selectViewModel,
};
