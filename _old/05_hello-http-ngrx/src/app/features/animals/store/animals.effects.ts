import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from "rxjs";
import { toApiErrorMessage } from "@core/http/api-error";
import { AnimalsApi } from "../data-access/animals.api";
import { AnimalListPageActions, AnimalsApiActions, AnimalsFilterActions } from "./animals.actions";

/** キーワード入力を state に載せるまでの待ち時間（ミリ秒）。 */
const KEYWORD_DEBOUNCE_MS = 250;

/**
 * 一覧の取得。
 *
 * switchMap なので、応答を待たずに再読み込みしても古い方は破棄される。
 * catchError は内側の Observable に置くこと。外側に置くと 1 回失敗した時点で
 * actions$ ごと完了し、2 回目以降の「再試行」が無反応になる。
 */
const loadAnimals = createEffect(
  (actions$ = inject(Actions), animalsApi = inject(AnimalsApi)) =>
    actions$.pipe(
      ofType(AnimalListPageActions.opened, AnimalListPageActions.reloadClicked),
      switchMap(() =>
        animalsApi.loadAnimals().pipe(
          map((animals) => AnimalsApiActions.loadAnimalsSucceeded({ animals })),
          catchError((error: unknown) =>
            of(AnimalsApiActions.loadAnimalsFailed({ error: toApiErrorMessage(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

/**
 * 入力が落ち着いてから state に載せ、グリッドの再フィルタ回数を抑える。
 *
 * 「何ミリ秒待つか」は画面の都合ではなく状態更新の都合なので、
 * component の setTimeout ではなく action 経路の途中に置く。
 * 通信を伴わない effect だが、時間を扱う時点で副作用なので置き場所はここで正しい。
 */
const settleKeyword = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(AnimalListPageActions.keywordInputChanged),
      debounceTime(KEYWORD_DEBOUNCE_MS),
      map(({ keyword }) => keyword.trim()),
      distinctUntilChanged(),
      map((keyword) => AnimalsFilterActions.keywordSettled({ keyword })),
    ),
  { functional: true },
);

export const animalsEffects = {
  loadAnimals,
  settleKeyword,
};
