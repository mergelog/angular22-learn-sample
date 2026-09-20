import {
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props,
} from '@ngrx/store';

export const P00_STORE_BRIDGE_FEATURE_KEY = 'p00StoreBridge';

export interface WorkItem {
  readonly id: number;
  readonly title: string;
  readonly owner: string;
}

export interface StoreBridgeState {
  readonly items: readonly WorkItem[];
  readonly selectedItemId: number | null;
}

const initialState: StoreBridgeState = {
  items: [
    { id: 1, title: 'テスト結果を確認', owner: '田中' },
    { id: 2, title: 'リリースノートを作成', owner: '佐藤' },
    { id: 3, title: '監視アラートを整理', owner: '鈴木' },
  ],
  selectedItemId: null,
};

export const storeBridgeActions = {
  itemSelected: createAction('[Store Bridge] Item Selected', props<{ itemId: number }>()),
  selectionCleared: createAction('[Store Bridge] Selection Cleared'),
};

export const storeBridgeReducer = createReducer(
  initialState,
  on(storeBridgeActions.itemSelected, (state, { itemId }) => ({
    ...state,
    selectedItemId: itemId,
  })),
  on(storeBridgeActions.selectionCleared, (state) => ({ ...state, selectedItemId: null })),
);

const selectStoreBridgeState = createFeatureSelector<StoreBridgeState>(
  P00_STORE_BRIDGE_FEATURE_KEY,
);

export const storeBridgeSelectors = {
  items: createSelector(selectStoreBridgeState, (state) => state.items),
  selectedItemId: createSelector(selectStoreBridgeState, (state) => state.selectedItemId),
  selectedItem: createSelector(selectStoreBridgeState, (state) =>
    state.items.find((item) => item.id === state.selectedItemId),
  ),
};
