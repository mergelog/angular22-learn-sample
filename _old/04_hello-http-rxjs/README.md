# 04 HttpClient + RxJS + AG Grid

Angular 22。03 の NgRx を外し、**RxJS だけで状態を持つ**構成に置き換えたサンプル。
取得した JSON を AG Grid で一覧表示し、列フィルタとクイックフィルタで絞り込めるようにしてある。

UI は「動物一覧」の 1 画面だけ。画面数を増やす代わりに、
NgRx を使わない場合でも大規模案件で通用する層の切り方に寄せてある。

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

## ディレクトリ構成

```
src/
  environments/              ビルド構成で差し替わる設定値
  app/
    app.config.ts            ルートの provider（router / http）
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
      state/rx-store.ts      RxJS だけで組む feature store の基底クラス
      ui/spinner/
      ui/error-banner/
    features/
      animals/
        animals.routes.ts    この feature のルート定義 + DI の登録
        animal-kind.labels.ts
        data-access/         API との境界
          animal.dto.ts      API のレスポンス形
          animal.model.ts    アプリ内のドメイン型
          animal.mapper.ts   DTO → ドメイン型の変換
          animals.api.ts     HttpClient を叩く唯一の場所
        store/
          animals.state.ts   状態の形と初期値
          animals.store.ts   トリガー・HTTP 接続・公開ストリーム
        pages/               ルートに紐づく smart component
          animal-list-page/
        components/          feature 内の presentational component
          animal-grid/       AG Grid のラッパー + 列定義
          animal-filter-bar/ キーワード入力と再読み込み
```

依存の向きは **features → shared / core** の一方向。
`shared` や `core` が `features` を import していたら設計が壊れている。

## 03 から変えた点

### 1. NgRx を外し、RxJS の store に置き換える

action / reducer / selector / effect の 4 ファイルは無くなったが、**責務の分け方は変えていない**。

| NgRx | 04 の対応物 |
|---|---|
| action の dispatch | `store.load()` / `store.changeKeyword()` などのメソッド |
| reducer | `RxStore#patch`（差分を渡して新しいオブジェクトに差し替える） |
| selector | `RxStore#select`（`map` + `distinctUntilChanged`） |
| effect | `connectLoadAnimals()` の `Subject` → `switchMap` の 1 本 |

判断基準は「1 つの出来事に複数箇所が反応するか」。
反応しないうちは NgRx の action テーブルは費用対効果が合わないので、この形で足りる。
逆に、この store が 300 行を超えたり feature をまたいで状態を共有し始めたら 03 に戻る。

### 2. 状態の入り口を `RxStore` に閉じる

```ts
export abstract class RxStore<TState extends object> {
  private readonly state$: BehaviorSubject<TState>;
  protected select<TSlice>(project: (state: TState) => TSlice): Observable<TSlice>
  protected patch(partial: Partial<TState>): void
}
```

`state$` を `private` にして外へ出さないのが要点。`BehaviorSubject` を公開すると
どこからでも `next()` できてしまい、「状態が変わる場所」を grep で追えなくなる。

`select` に `distinctUntilChanged` を入れてあるので、`keyword` だけ変わったときに
`animals$` の下流（= グリッドの再描画）は動かない。

### 3. HTTP は「トリガー Subject → switchMap」の 1 本にする

```ts
this.reload$.pipe(
  tap(() => this.patch({ status: "loading", error: null })),
  switchMap(() => this.animalsApi.loadAnimals().pipe(
    map(...),
    catchError(...),   // ← 内側の pipe に置く
  )),
  takeUntilDestroyed(this.destroyRef),
).subscribe((partial) => this.patch(partial));
```

- `load()` の中で毎回 `subscribe` すると購読が積み上がり、解除の責任も呼び出し側に散る。
  接続は constructor で 1 回だけ張り、以降は `reload$.next()` を流すだけにする
- `catchError` は 03 の effect と同じ理由で**内側**に置く。外側に置くと 1 回失敗した時点で
  ストリームごと完了し、再試行ボタンが無反応になる
- `switchMap` なので、再読み込みを連打しても古いリクエストの結果は捨てられる
- 購読解除は `takeUntilDestroyed(this.destroyRef)`。store はルートの provider なので、
  feature を離れた時点で購読ごと消える

### 4. 入力の debounce は component ではなく store に置く

```ts
this.keywordInput$.pipe(
  debounceTime(250),
  map((keyword) => keyword.trim()),
  distinctUntilChanged(),
)
```

`AnimalFilterBar` は入力値をそのまま `keywordChange` で流すだけで、`setTimeout` も持たない。
「何ミリ秒待つか」は画面の都合ではなく状態更新の都合なので、store 側の責務。
presentational component が非同期の事情を持たないので、テストもそのまま書ける。

なお、debounce した値を入力欄へ双方向に戻していないのは意図的で、
250ms 遅れて値が返るとカーソル位置が飛ぶ。入力欄の値は DOM に持たせたままにする。

### 5. 画面へは Observable、テンプレートでは signal

store は `animals$` `keyword$` `isLoading$` `error$` `summary$` を公開し、
`toSignal(..., { requireSync: true })` で component 側が signal に変換する。

`requireSync` を付けているのは、初期値を 2 箇所（store と component）に書かないため。
`BehaviorSubject` 由来のストリームは購読と同時に必ず 1 回流れるので、
流れてこなければ配線ミスとしてビルド時ではなく起動時に落ちる方が早く気付ける。

### 6. AG Grid の登録は feature のルートで行う

AG Grid v33 以降は使用機能をモジュールとして明示登録する。
`app.config.ts` に書くと ag-grid 本体が初期バンドルに入るので、feature 側に置く。

```ts
providers: [provideAgGrid(), AnimalsApi, AnimalsStore],
```

| 登録場所 | Initial total |
|---|---|
| `app.config.ts` | 1.33 MB |
| `animals.routes.ts` | 239 kB |

グリッドを使わない画面を持つアプリでは、この差がそのまま初回表示に出る。

### 7. 列定義を component から分離する

`animal-grid.columns.ts` に `ANIMAL_COLUMN_DEFS` と `ANIMAL_GRID_DEFAULT_COL_DEF` を置く。
列定義は業務要件がそのまま出る場所で、実案件では数百行になる。

`kind` 列は `valueGetter` でラベル（犬 / 猫）に変換している。
`valueFormatter` で見た目だけ変えると、表示は「犬」なのにフィルタは `dog` でしか当たらない、
という食い違いが起きる。フィルタもソートも通す値は `valueGetter` で決める。

### 8. 2 種類のフィルタを使い分ける

| | 担当 | 実装 |
|---|---|---|
| 列ごとの絞り込み | AG Grid | `floatingFilter` + `agTextColumnFilter` / `agNumberColumnFilter` |
| 列をまたぐ横断検索 | RxJS → AG Grid | store の `keyword` を `[quickFilterText]` に流す |

両方同時に効く（種別 = 猫 かつ 年齢 = 3 → 4 件）。
どちらも AG Grid が内部で処理するので、絞り込みのたびに配列を作り直すコードは書かない。

### 9. 表示件数はグリッドから store へ返す

フィルタ後の件数を知っているのは AG Grid だけなので、`modelUpdated` で受けて store に戻す。

```ts
protected onModelUpdated(event: ModelUpdatedEvent<Animal>): void {
  this.visibleCountChange.emit(event.api.getDisplayedRowCount());
}
```

`filterChanged` ではなく `modelUpdated` を見ているのは、
再読み込みで行データを差し替えたときにも件数を更新するため。

`AnimalGrid` 自身は store も HttpClient も知らず、行を受け取って件数を返すだけなので
presentational component のまま保てる。

### 10. グリッドの見た目と文言を core に集約する

- `ag-grid.theme.ts` … `themeQuartz.withParams()` でアプリの配色に合わせる。
  v33 以降の Theming API なので CSS の import は不要
- `ag-grid.locale.ts` … フィルタの「含む」「以上」などの日本語訳。
  未定義キーは AG Grid 既定の英語にフォールバックする

画面ごとにテーマを渡すと配色がずれていくので、定義はここ 1 箇所だけにする。

## 動かして確認できること

| やること | 見えるもの |
|---|---|
| `/animals` を開く | 40 件表示。`animals-routes` / `animal-list-page` が別 chunk で読まれる |
| キーワードに `ac-1003` と入れる | 250ms 待ってから 8 件に絞られる（通信は走らない） |
| 種別の列フィルタに `猫` と入れる | 22 件。さらに年齢に `3` を足すと 4 件 |
| DevTools で `animals.json` を 500 にして再読み込み | エラー表示 → 再試行ボタンで復帰する（`catchError` が内側にある） |
| ヘッダのフィルタアイコンを押す | 「含む」「フィルタ…」と日本語で出る |

## 意図的に入れていないもの

- **NgRx** … 上の 1 のとおり。反応する側が 1 箇所しかない状態に action テーブルは重い
- **signal ベースの store** … `signal()` で状態を持つ書き方もあるが、
  このサンプルの主題は `switchMap` / `debounceTime` / `catchError` の置き場所なので RxJS に寄せた。
  境界（テンプレート）でだけ `toSignal` する
- **AG Grid Enterprise** … セットフィルタや行グループは Enterprise 機能。
  Community の範囲で列フィルタ + クイックフィルタに収めている
- **テスト** … `RxStore` と mapper は純粋な関数の集まりなので本来は最初に書く対象。
  このサンプルは構成の学習が目的なので省いている
