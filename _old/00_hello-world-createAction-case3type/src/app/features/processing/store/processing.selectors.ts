import { createFeatureSelector, createSelector } from '@ngrx/store';
import { processingFeatureKey, ProcessingState } from './processing.reducer';

export const selectProcessingState = createFeatureSelector<ProcessingState>(processingFeatureKey);

// state のフィールドが増えるたびにこの定型文が増えていく。
// 大規模では createFeature を使うとこれが丸ごと消える（actions.ts の冒頭を参照）

// A
export const selectIsProcessing = createSelector(
  selectProcessingState,
  (state) => state.isProcessing,
);

// B
export const selectIsSecondProcessing = createSelector(
  selectProcessingState,
  (state) => state.isSecondProcessing,
);

// C
export const selectIsThirdProcessing = createSelector(
  selectProcessingState,
  (state) => state.isThirdProcessing,
);
