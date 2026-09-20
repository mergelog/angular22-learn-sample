# 05 HttpClient + NgRx + AG Grid

Angular 22。**04 と画面も挙動も完全に同じ**まま、状態管理だけ RxJS 手組みの store から
NgRx に置き換えたサンプル。04 と並べて diff を取ると、NgRx を入れると何が増えて
何が動かないのかがそのまま読める。

差分があるのは次の 5 ファイルだけで、`data-access` と presentational component は 1 行も変わっていない。

```
app.config.ts                 provideStore / DevTools を追加
animals.routes.ts             provideState / provideEffects を追加
animal-list-page.ts           toSignal + store メソッド → selectSignal + dispatch
store/                        rx-store 派生の 1 クラス → action / reducer / selector / effect
shared/state/rx-store.ts      削除（NgRx が担う）
```

## 起動

```bash
npm install
npm start        # http://localhost:4200
```

`public/api/animals.json` の静的 JSON をスタブ API として `HttpClient` で取得する。

```jsonc
{
  "animals": [
    { "accountId": "ac-1004", "name": "ポチ", "kind": "dog", "age": 3, "weight": 31.5 }
    // ...全 40 件
  ]
}
```

## NgRx に載せたもの / 載せなかったもの

「状態管理ライブラリを入れた」からといって、全部をそこへ通すわけではない。
判断基準は **「その値の変化に、複数の場所が反応しうるか」** の 1 点。

| | NgRx | 理由 |
|---|---|---|
| 一覧データ・通信ステータス・エラー | ○ | 画面・スピナー・エラーバナー・件数表示が同じ 1 つの通信結果に反応する |
| 確定後のキーワード | ○ | グリッドのクイックフィルタと件数表示の両方が参照する |
| 表示件数 | ○ | グリッド発の値を、離れた場所（ヘッダのサマリ）が読む |
| API 通信・debounce | ○（effect） | いつ・何回走るかを 1 箇所で制御したい副作用 |
| DTO → ドメイン型の変換 | × | 入力が決まれば出力が決まる純粋関数。state に持つ必要がない |
| 列フィルタ・並び替え | × | AG Grid が内部で持つ表示専用の状態。store に写すと二重管理になる |
| 入力欄の生の文字列 | × | 確定前の値。action としては流すが reducer では受けない |
| ラベル辞書・グリッドのテーマ | × | 変化しない定数 |

**入力欄の値を state に持たないのは意図的**。debounce した値を入力欄へ戻すと、
250ms 遅れて値が返ってカーソル位置が飛ぶ。DOM に持たせたままにしておく。

## ディレクトリ構成

```
src/
  environments/              ビルド構成で差し替わる設定値
  app/
    app.config.ts            ルートの provider（router / http / store）
    app.routes.ts            ルーティングの入口。features を遅延読み込み
    core/                    アプリ全体で 1 つだけ存在する関心事
      grid/
        ag-grid.providers.ts AG Grid のモジュール登録
        ag-grid.locale.ts    グリッド UI 文言の日本語訳
        ag-grid.theme.ts     全画面共通のグリッド見た目
      http/
        api-base-url.interceptor.ts
        api-error.ts
    shared/                  どの feature からも使える、状態を持たない部品
      models/request-status.ts
      ui/spinner/
      ui/error-banner/
    features/
      animals/
        animals.routes.ts    この feature のルート定義 + state / effect / DI の登録
        animal-kind.labels.ts
        data-access/         API との境界（04 から変更なし）
          animal.dto.ts      API のレスポンス形
          animal.model.ts    アプリ内のドメイン型
          animal.mapper.ts   DTO → ドメイン型の変換
          animals.api.ts     HttpClient を叩く唯一の場所
        store/
          animals.actions.ts  起きたことの定義（3 グループ）
          animals.reducer.ts  state の形 + createFeature
          animals.selectors.ts 画面へ公開する読み取り口
          animals.effects.ts  HTTP と debounce
        pages/               ルートに紐づく smart component
          animal-list-page/
        components/          feature 内の presentational component
          animal-grid/       AG Grid のラッパー + 列定義
          animal-filter-bar/ キーワード入力と再読み込み
```

effect は「更新対象の state と同じ feature の下」に置く。
`core/effects/` のような場所に集めると、state を 1 つ増やすたびに離れた 2 箇所を触ることになる。

## 04 から変えた点

### 1. store 1 クラスを 4 ファイルに開く

責務の切り方は 04 と同じで、置き場所が変わっただけ。

| 04（RxJS 手組み） | 05（NgRx） |
|---|---|
| `store.load()` などのメソッド | `store.dispatch(AnimalListPageActions.opened())` |
| `RxStore#patch` | `createReducer` + `on` |
| `RxStore#select` | `createFeature` の自動生成 selector + `createSelector` |
| `connectLoadAnimals()` の `Subject` → `switchMap` | `createEffect` + `ofType` |
| `takeUntilDestroyed(destroyRef)` | 不要（`provideEffects` がルートの寿命で管理する） |
| `toSignal(..., { requireSync: true })` | `store.selectSignal(...)` |

行数はむしろ増える。増える代わりに手に入るのは、
**「状態が変わる瞬間が action として全部名前を持つ」**ことと、DevTools でその履歴が全部見えること。

### 2. action は「命令」ではなく「起きたこと」で名付ける

```ts
export const AnimalListPageActions = createActionGroup({
  source: "Animal List Page",
  events: {
    Opened: emptyProps(),
    "Reload Clicked": emptyProps(),
    "Keyword Input Changed": props<{ keyword: string }>(),
    "Visible Row Count Changed": props<{ visibleCount: number }>(),
  },
});
```

`loadAnimals()` のような命令名にすると、同じ処理を別の画面からも起こしたくなった時点で
action が増えるか、意味の合わない action を流用することになる。
出来事で名付けておけば、reducer と effect の側が「その出来事にどう反応するか」を各自決められる
（実際 `opened` と `reloadClicked` は、reducer では同じ `on` にまとめ、effect でも同じ `ofType` に入っている）。

source は **出来事が起きた場所** で分ける。この feature には 3 つある。

| source | 誰が dispatch するか |
|---|---|
| `Animal List Page` | 画面（component） |
| `Animals Filter` | effect（debounce 後の確定値） |
| `Animals API` | effect（通信の成功・失敗） |

DevTools のログが `[Animal List Page] Keyword Input Changed` → `[Animals Filter] Keyword Settled`
と並ぶので、どこ発の出来事なのかを読むのに実装を見に行かなくてよくなる。

### 3. state と effect は feature のルートで登録する

```ts
providers: [
  provideAgGrid(),
  provideState(animalsFeature),
  provideEffects(animalsEffects),
  AnimalsApi,
],
```

`app.config.ts` の `provideStore({}, ...)` は空の store だけを置く。
feature の reducer / effect は遅延読み込みされる chunk 側に入るので、
`/animals` を開くまで NgRx の feature コードはダウンロードもされない。

| | Initial total | animals-routes chunk |
|---|---|---|
| 04（RxJS） | 239 kB | 357 B |
| 05（NgRx） | 276 kB | 5.4 kB |

初期バンドルの +37 kB は `@ngrx/store` + `@ngrx/effects` の本体。
DevTools は `environment.production` で分岐しているので production ビルドには入らない。

### 4. HTTP は effect に置く

```ts
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
```

- `catchError` は**内側**の pipe に置く。外側に置くと 1 回失敗した時点で `actions$` ごと完了し、
  以降どの action も届かない = 再試行ボタンが無反応になる（04 の store と同じ理屈）
- `switchMap` なので、再読み込みを連打しても古いリクエストの結果は捨てられる
- 購読解除のコードは無い。effect の寿命は `provideEffects` を書いたルートに紐づく

### 5. debounce も effect に置く

```ts
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
```

通信をしない effect だが、**時間を扱う時点で副作用**なので置き場所はここで正しい。
component の `setTimeout` にすると「何ミリ秒待つか」が画面ごとにばらけ、reducer に持ち込むのは論外
（reducer は同じ入力なら同じ出力でなければならない）。

reducer が受けるのは `Keyword Settled` だけで、キーストロークごとの `Keyword Input Changed` は
どの `on` にも現れない。**action は流れるが state は動かない**という状態が普通にあってよい。

### 6. 同じ値なら state を作り直さない

```ts
on(AnimalListPageActions.visibleRowCountChanged, (state, { visibleCount }): AnimalsState =>
  state.visibleCount === visibleCount ? state : { ...state, visibleCount },
),
```

`modelUpdated` はフィルタ・並び替え・行データ差し替えのいずれでも飛んでくる。
毎回 `{ ...state }` を作ると、値が同じでも state の参照が変わって全 selector が再計算される。
04 の store で `if (this.snapshot.visibleCount !== visibleCount)` と書いていたのと同じ判断を、
NgRx では reducer の中でやる。

### 7. selector は「自動生成 + 派生」に分け、公開口を 1 つにまとめる

`createFeature` が `selectAnimals` `selectKeyword` `selectStatus` … を自動で生やすので、
1 プロパティを読むだけの selector は書かない。書くのは加工が要るものだけ。

```ts
const selectSummary = createSelector(
  selectTotalCount,
  animalsFeature.selectVisibleCount,
  (totalCount, visibleCount) => `${totalCount} 件中 ${visibleCount} 件を表示`,
);

export const AnimalsSelectors = { ... };
```

画面には `AnimalsSelectors` 経由だけを触らせる。component が `animalsFeature.selectXxx` を
直接 import すると、state の形を変えたときに画面まで巻き込まれる。

### 8. 画面は selectSignal と dispatch だけになる

```ts
protected readonly animals = this.store.selectSignal(AnimalsSelectors.selectAnimals);
...
protected onKeywordChange(keyword: string): void {
  this.store.dispatch(AnimalListPageActions.keywordInputChanged({ keyword }));
}
```

04 では `toSignal(..., { requireSync: true })` が必要だったが、`selectSignal` は
store が同期的に現在値を持っているので初期値の指定が要らない。
テンプレートは 04 から 1 文字も変わっていない。

### 9. runtimeChecks は最初から全部 ON にする

```ts
provideStore({}, {
  runtimeChecks: {
    strictStateImmutability: true,
    strictActionImmutability: true,
    strictStateSerializability: true,
    strictActionSerializability: true,
    strictActionTypeUniqueness: true,
  },
});
```

後から有効化すると違反が数百件出て結局 off に戻すことになるので、1 画面のうちに入れておく。
開発ビルドでのみ動き、production ビルドでは無効になる。

state は freeze されるため `rowData` として AG Grid に渡る配列も凍っているが、
Community のセル編集なしの構成では書き換えが起きないので問題なく動く。

## 動かして確認できること

| やること | 見えるもの |
|---|---|
| `/animals` を開く | 40 件表示。`animals-routes` / `animal-list-page` が別 chunk で読まれる |
| キーワードに `ac-1003` と入れる | 250ms 待ってから 8 件に絞られる（通信は走らない） |
| 種別の列フィルタに `猫` と入れる | 22 件。さらに年齢に `3` を足すと 4 件 |
| DevTools で `animals.json` を 500 にして再読み込み | エラー表示 → 再試行ボタンで復帰する（`catchError` が内側にある） |
| Redux DevTools を開く | 打鍵ごとの `Keyword Input Changed` と、250ms 後の `Keyword Settled` が並ぶ |
| Redux DevTools で time travel する | 一覧・件数・エラー表示が state に完全従属していることが確認できる |

## 意図的に入れていないもの

- **`@ngrx/entity`** … `accountId` は飼い主単位の ID で、40 件に対し 8 種類しかない。
  行を一意に識別できない以上 `selectId` を作れない。加えて AG Grid には配列を渡すので、
  `ids` / `entities` に持ち替えても `selectAll` で戻すだけになる。
  entity adapter は「ID 指定の更新・削除が頻繁にある一覧」で効く（03 がその例）
- **SignalStore（`@ngrx/signals`）** … Classic NgRx と対比させるのがこのサンプルの主題。
  同じ画面を SignalStore で書くと、04 の `AnimalsStore` にかなり近い形になる
- **`@ngrx/router-store`** … URL に絞り込み条件を持たせるなら入れる価値があるが、
  この画面は 1 つで、リロードで条件を復元する要件も置いていない
- **AG Grid Enterprise** … セットフィルタや行グループは Enterprise 機能。
  Community の範囲で列フィルタ + クイックフィルタに収めている
- **テスト** … reducer と selector と mapper は純粋関数なので本来は最初に書く対象。
  このサンプルは構成の学習が目的なので省いている
