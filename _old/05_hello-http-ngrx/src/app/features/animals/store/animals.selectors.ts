import { createSelector } from "@ngrx/store";
import { animalsFeature } from "./animals.reducer";

const selectIsLoading = createSelector(
  animalsFeature.selectStatus,
  (status) => status === "loading",
);

const selectTotalCount = createSelector(animalsFeature.selectAnimals, (animals) => animals.length);

/** 「40 件中 12 件を表示」のようなサマリ。全件数と表示件数の両方に追従する。 */
const selectSummary = createSelector(
  selectTotalCount,
  animalsFeature.selectVisibleCount,
  (totalCount, visibleCount) => `${totalCount} 件中 ${visibleCount} 件を表示`,
);

/**
 * 画面が触れてよい selector をここに集約する。
 * component が createFeature の selector を直接 import すると、
 * state の形を変えたときに画面側まで巻き込まれる。
 */
export const AnimalsSelectors = {
  selectAnimals: animalsFeature.selectAnimals,
  selectKeyword: animalsFeature.selectKeyword,
  selectError: animalsFeature.selectError,
  selectIsLoading,
  selectTotalCount,
  selectSummary,
};
