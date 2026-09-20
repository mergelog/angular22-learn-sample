import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatMap, map, startWith, take } from 'rxjs';
import { ColorSyncService } from '../../../core/services/color-sync.service';
import { TogglePageActions } from '../../toggle/store/toggle.actions';
import { ToggleSelectors } from '../../toggle/store/toggle.reducer';
import { ColorActions } from './color.actions';

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
      concatMap(() => {
        // $ が付く場面 (1): Effect 内でストリームを一旦変数に置く
        //
        // 01 では store.select(...).pipe(take(1), ...) と一息に繋いでいた。
        // 動作は同じだが、ネストが深くなるほど「今どのストリームを操作しているか」が
        // 追いにくくなるので、意味の区切りで名前を付けて分解する。
        //
        // take(1) は「今の値を 1 つ取ったら完了する」の意味。
        // selector は完了しない無限ストリームなので、これが無いと
        // concatMap の内側が終わらず、次のクリックが待たされ続ける。
        const isOn$ = store.select(ToggleSelectors.selectIsOn).pipe(take(1));

        // reducer が toggle 状態を更新した後の値を読み、別 state の色を同期する。
        return isOn$.pipe(
          concatMap((isOn) => {
            // $ が付く場面 (2): 非同期処理を返すサービスの戻り値を変数に束ねる
            //
            // syncColor() は Observable<string> を返すだけで、この時点では何も起きない。
            // 実際に HTTP が飛ぶのは購読された瞬間（= return 後に Effect が購読したとき）。
            // 「呼んだ＝実行された」ではないことが、名前に $ を付けると意識しやすい。
            const color$ = colorSyncService.syncColor(isOn);

            return color$.pipe(
              map((color) => ColorActions.syncSucceeded({ color })),
              // 同期の完了前に「開始した」を先に流す。map の後に置くので順序は
              // syncStarted → syncSucceeded になる。
              startWith(ColorActions.syncStarted()),
            );
          }),
        );
      }),
    ),
  { functional: true },
);

export const colorEffects = {
  syncColorAfterToggle,
};
