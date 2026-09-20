import {
  createAction,
  createFeatureSelector,
  createSelector,
  props,
} from '@ngrx/store';

export const P00_NOVICE_FEATURE_KEY = 'p00Novice';

export interface P00NoviceCard {
  id: number;
  name: string;
}

export interface P00NoviceState {
  cards: readonly P00NoviceCard[];
}

const initialState: P00NoviceState = {
  cards: [{ id: 1, name: 'カード 1' }],
};

export const p00NoviceActions = {
  cardAddClicked: createAction('[P00 Novice] Card Add Clicked'),
  cardNameChanged: createAction(
    '[P00 Novice] Card Name Changed',
    props<{ id: number; name: string }>(),
  ),
};

/**
 * NgRx の基本形となる reducer。
 * 現在の state と action だけから、次の state を返す純粋関数として記述する。
 */
export function p00NoviceReducer(
  state: P00NoviceState = initialState,
  action: ReturnType<(typeof p00NoviceActions)[keyof typeof p00NoviceActions]>,
): P00NoviceState {
  switch (action.type) {
    case p00NoviceActions.cardAddClicked.type: {
      const nextId = Math.max(0, ...state.cards.map((card) => card.id)) + 1;

      return {
        ...state,
        cards: [...state.cards, { id: nextId, name: `カード ${nextId}` }],
      };
    }

    case p00NoviceActions.cardNameChanged.type:
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.id ? { ...card, name: action.name } : card,
        ),
      };

    default:
      return state;
  }
}

const selectP00NoviceState = createFeatureSelector<P00NoviceState>(
  P00_NOVICE_FEATURE_KEY,
);

export const p00NoviceSelectors = {
  cards: createSelector(selectP00NoviceState, (state) => state.cards),
};
