import { createReducer, on } from '@ngrx/store';
import { ProcessingActions, userClickedSecondToggleButton } from './processing.actions';

export const processingFeatureKey = 'processing';

// 3 通りの書き方を独立に動かすため、状態も 3 つに分けてある
export interface ProcessingState {
  isProcessing: boolean; // A
  isSecondProcessing: boolean; // B
  isThirdProcessing: boolean; // C
}

export const initialProcessingState: ProcessingState = {
  isProcessing: false, // A
  isSecondProcessing: false, // B
  isThirdProcessing: false, // C
};

export const processingReducer = createReducer(
  initialProcessingState,
  // A: createActionGroup / スペース区切り。この .userClickedToggleButton から
  //    processing.actions.ts へは Go to Definition で飛べない（詳細は actions.ts の冒頭）
  on(ProcessingActions.userClickedToggleButton, (state) => ({
    ...state,
    isProcessing: !state.isProcessing,
  })),
  // B: createAction。ここから定義へ飛べる唯一の書き方
  on(userClickedSecondToggleButton, (state) => ({
    ...state,
    isSecondProcessing: !state.isSecondProcessing,
  })),
  // C: createActionGroup / 1 語。A と同じく定義へ飛べない
  on(ProcessingActions.toggle, (state) => ({
    ...state,
    isThirdProcessing: !state.isThirdProcessing,
  })),
);
