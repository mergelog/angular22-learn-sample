import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatMap, map, startWith, take } from 'rxjs';
import { ColorSyncService } from '../services/color-sync.service';
import { ColorActions } from '../../features/color/store/color.actions';
import { TogglePageActions } from '../../features/toggle/store/toggle.actions';
import { ToggleSelectors } from '../../features/toggle/store/toggle.reducer';

const syncColorAfterToggle = createEffect(
  (
    // Actions は `class Actions<V> extends Observable<V>`、つまり Observable のサブクラス。
    // 同時に injectable でもあるので、inject() で取り出してそのまま .pipe() できる。
    // 中身は「dispatch された全アクションが流れ続けるストリーム」で、完了しない。
    //
    // 末尾の $ は「この変数は Observable」という目印（Finnish notation）。
    // 言語仕様上の意味はなく付けなくても動くが、
    //   - .subscribe() / .pipe() してよい値だと一目で分かる
    //   - 同期値とストリームを同名で並べられる（user と user$）
    //   - Signal には付けない慣習なので、両者が混ざるコードでも見分けが付く
    actions$ = inject(Actions),
    store = inject(Store),
    colorSyncService = inject(ColorSyncService),
  ) =>
    actions$.pipe(
      // actions$ には他 feature のアクションも NgRx 内部のものも全部流れてくるので、
      // ofType で扱うものだけ通す。実質は type 文字列での filter:
      //   ≒ filter(action => action.type === '[Toggle Page] Button Clicked')
      // （type は createActionGroup の source と event 名から自動生成される）
      //
      // ただの filter と違い型の絞り込みも同時に行うため、
      // 下流ではそのアクションの props が型として正しく見える。
      // 複数許可したいときは ofType(A.foo, B.bar) と並べれば OR（型はユニオン）になる。
      ofType(TogglePageActions.buttonClicked),
      concatMap(() =>
        store.select(ToggleSelectors.selectIsOn).pipe(
          take(1),
          // reducer が toggle 状態を更新した後の値を読み、別 state の色を同期する。
          concatMap((isOn) =>
            colorSyncService
              .syncColor(isOn)
              .pipe(map((color) => ColorActions.syncSucceeded({ color })))
              .pipe(startWith(ColorActions.syncStarted())),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const appEffects = {
  syncColorAfterToggle,
};
