import { createFeature, createReducer, on } from "@ngrx/store";
import { RequestStatus } from "@shared/models/request-status";
import { Animal } from "../data-access/animal.model";
import { AnimalListPageActions, AnimalsApiActions, AnimalsFilterActions } from "./animals.actions";

export interface AnimalsState {
  /** API から取得した全件。AG Grid の rowData の元になる。 */
  animals: Animal[];
  status: RequestStatus;
  error: string | null;
  /** クイックフィルタの文字列。入力そのままではなく debounce 後の値が入る。 */
  keyword: string;
  /** AG Grid 側のフィルタ適用後に実際に表示されている行数。 */
  visibleCount: number;
}

const initialState: AnimalsState = {
  animals: [],
  status: "idle",
  error: null,
  keyword: "",
  visibleCount: 0,
};

/**
 * createFeature を使うと `selectAnimals` などの selector が自動で生えるので、
 * 単純な 1 プロパティ参照のために createSelector を書かなくてよくなる。
 */
export const animalsFeature = createFeature({
  name: "animals",
  reducer: createReducer(
    initialState,

    on(
      AnimalListPageActions.opened,
      AnimalListPageActions.reloadClicked,
      (state): AnimalsState => ({
        ...state,
        status: "loading",
        error: null,
      }),
    ),

    on(AnimalsApiActions.loadAnimalsSucceeded, (state, { animals }): AnimalsState => ({
      ...state,
      animals,
      status: "success",
      error: null,
      /** グリッドが modelUpdated を返すまでの一瞬、件数がズレて見えるのを防ぐ。 */
      visibleCount: animals.length,
    })),

    on(AnimalsApiActions.loadAnimalsFailed, (state, { error }): AnimalsState => ({
      ...state,
      animals: [],
      status: "error",
      error,
      visibleCount: 0,
    })),

    on(AnimalsFilterActions.keywordSettled, (state, { keyword }): AnimalsState => ({
      ...state,
      keyword,
    })),

    /**
     * modelUpdated は並び替えや再描画でも飛んでくるので、同じ値なら state を作り直さない。
     * 参照が変わらなければ下流の selector も再計算されない。
     */
    on(AnimalListPageActions.visibleRowCountChanged, (state, { visibleCount }): AnimalsState =>
      state.visibleCount === visibleCount ? state : { ...state, visibleCount },
    ),
  ),
});
