// 20260912

// for Effect
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, timer } from 'rxjs';
// base
import {
  createActionGroup,
  createFeature,
  createReducer,
  emptyProps,
  on,
  props
} from "@ngrx/store"

// model
export interface P00CanvasStete {
  name: string
  num: number
  status: string
}

// initial
export const initialP00CanvasState: P00CanvasStete = {
  name: '-',
  num: 0,
  status: 'stand-by'
}

// action
export const p00CanvasActions = createActionGroup({
  source: 'P00Canvas',
  events: {
    'setter': props<P00CanvasStete>(),
    'changeName': props<{ name: string }>(),
    'changeNum': props<{ name: string, num: number }>(),
    'changeStatusToStandBy': emptyProps()
  }
})

// reducer
export const p00CanvasFeature = createFeature({
  name: 'p00Canvas',
  reducer: createReducer(
    initialP00CanvasState,
    on(p00CanvasActions.setter, (state, pp) => ({
      ...state,
      name: pp.name,
      num: pp.num
    })),
    on(p00CanvasActions.changeName, (state, pp) => ({
      ...state,
      name: pp.name,
      status: 'updated .. view 1s'
    })),
    on(p00CanvasActions.changeNum, (state, pp) => ({
      ...state,
      num: pp.num,
    })),
    on(p00CanvasActions.changeStatusToStandBy, (state) => ({
      ...state,
      status: 'stand-by'
    }))
  )
})

// selector
export const p00MyCanvasSelectors = {
  name: p00CanvasFeature.selectName,
  num: p00CanvasFeature.selectNum,
  status: p00CanvasFeature.selectStatus
}

// effect
export const changeNameStatus = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(p00CanvasActions.changeName),
      switchMap(() =>
        timer(1000).pipe(
          map(() => p00CanvasActions.changeStatusToStandBy()),
        ),
      ),
    ),
  { functional: true },
);

/* ---
    ファイル分ける場合、
    クラス形式: this.actions$ としてクラスのプロパティに持つ
    Angular の DI テスト手法がそのまま使えるので、functionalにという懸念は不要
   ---
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, timer } from 'rxjs';
import { p00CanvasActions } from '../store/p00.store';

@Injectable()
export class P00CanvasEffects {
  private readonly actions$ = inject(Actions);

  readonly changeNumStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(p00CanvasActions.changeNum),
      switchMap(() =>
        timer(1000).pipe(
          map(() => p00CanvasActions.changeStatusToStandBy()),
        ),
      ),
    ),
  );
}
*/






/*
はい、@ngrx/store（Redux モデル）ではそれが仕様です。「何が起きたか（Action）」と「状態がどう変わるか（Reducer）」を意図的に分離しているので、両方書くことになります。

ただし 1 Action : 1 Reducer ケース、ではありません。実際は N:M です。


// 1つのハンドラを複数 Action で共有できる
on(aSampleActions.changeName, aSampleActions.resetName, (state, pp) => ...)

// 逆に1つの Action を複数 feature の reducer が拾える（発行側は知らなくていい）
この「発行側が購読側を知らない」点が boilerplate の対価です。DevTools で全イベントが時系列に残り、後から feature を足しても既存の dispatch 側を触らなくて済む。

減らす方向は2つ
1. @ngrx/signals の SignalStore を使う

deps にもう入っています（@ngrx/signals: ^22.0.0）。patchState で直接更新するので Action/Reducer のペアが消えます。a-sample.store.ts:56 の TODO はこれですね。Action ログが要らない画面ローカルな状態ならこちらのほうが素直です。

2. Action を「イベント名」で切る

逆効果になりやすいのが、boilerplate を減らすために汎用 setter を作る方向です。現状の setter がそれで、Action が「イベント」ではなく「命令」になり、DevTools 上で [ASample] setter が並ぶだけになります。NgRx が Good Action Hygiene と呼んでいる原則では、発生源と出来事で命名します。


export const aSamplePageActions = createActionGroup({
  source: 'A Sample Page',              // 発生源
  events: {
    'Change Name Clicked': props<{ name: string }>(),   // → changeNameClicked
    'Opened': emptyProps(),
  }
})
createActionGroup はスペース入りの名前を camelCase のプロパティに変換し、type は [A Sample Page] Change Name Clicked になります。Action 数は増えますが、大規模だとこちらのほうが追跡できます。API 経由なら aSampleApiActions として source を分けるのが定石です。

どちらの方向に振るか決まれば書き換えます。

Remote Control is active · Continue here, on your phone, or at claude.ai/code

*/