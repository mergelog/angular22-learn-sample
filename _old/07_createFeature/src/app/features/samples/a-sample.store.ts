import { createActionGroup, createFeature, createReducer, on, props } from "@ngrx/store"

// model
export interface ASample {
  name: string
  num: number
  status: string
}

// initial
export const initialASample: ASample = {
  name: '-',
  num: 0,
  status: 'start status'
}

// action
export const aSampleActions = createActionGroup({
  source: 'ASample',
  events: {
    'setter': props<ASample>(),
    'changeName': props<{ name: string }>(),
  }
})

// reducer
export const aSampleFeature = createFeature({
  name: 'aSample',
  reducer: createReducer(
    initialASample,
    on(aSampleActions.setter, (state, pp) => ({
      ...state,
      name: pp.name,
      num: pp.num
    })),
    on(aSampleActions.changeName, (state, pp) => ({
      ...state,
      name: pp.name,
    }))
  )
})

// selector
export const aSampleSelectors = {
  name: aSampleFeature.selectName,
  num: aSampleFeature.selectNum,
  status: aSampleFeature.selectStatus
}

// TODO: feature/sample/pages/a-sample に移動する
//       ng コマンド使って コンポーネント作成する
// TODO:
// - 表示、ボタン操作、セレクト、チェックボックス
// - effect、その他の標準あるある
//
// TODO: Signalを使用して理解する
//

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