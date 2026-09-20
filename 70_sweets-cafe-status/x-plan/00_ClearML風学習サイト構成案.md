# ClearML風学習サイト構成案

## 1. この資料で決めること

`70_sweets-cafe-status` に、ClearML の Experiments 画面を縮小した「テーブル一覧＋右ペイン詳細」を作る。

この資料は、コンポーネントの分け方、URL、状態の正本、継承の範囲、実装順序を固定する。実装時に別の設計判断が必要になった場合は、この資料を先に更新する。

## 2. 初期完成版のスコープ

### 作るもの

- `/cafe-status` のテーブル一覧
- 行選択で開く右ペイン
- 右ペイン内の overview 画面
- 状態、人数、会計金額の更新
- 手動の再読み込みと、取得時刻（`generatedAt`）の表示
- URL と連動する選択、閉じる操作、戻る/進む
- NgRx による取得・更新・エラー管理
- Signal による部品内の一時的な UI 状態管理
- ClearML の構成を読むための、一覧用と詳細用の基底 class

### 初期完成版では作らないもの

- orders / reservations タブと子ルート
- 予約追加フォーム
- 定期ポーリング（自動再取得）
- 複数行選択、比較、アーカイブ、タグ、動的列
- 権限、共有、グラフ、詳細ペインの最大化
- 汎用的な entity フレームワーク

最初から全てを ClearML に合わせない。初期完成版では「一覧、選択した 1 件の詳細、更新」の一方向フローを完成させる。

## 3. 現在地

2026-09-19 時点の実装は次の状態である。

- ルート: `/dashboard`、`/view-json`、`''` と `**` は `/dashboard` へリダイレクト
- API: `CafeDashboardApi`
  - `getDashboard()` … `GET /api/cafe-status`
  - `getOrders()` … `GET /api/cafe-orders`
  - `updateTable()` … `PUT /api/cafe-status`
  - `clearTable()` … `DELETE /api/cafe-status/:tableNumber`
  - `addReservation()` … `POST /api/cafe-status/:tableNumber/reservations`
- 擬似バックエンド: `cafeBackendInterceptor` と `CafeSimulationStore`
- モデル: `CafeDashboard`、`CafeTable`、`CafeOrder`、`CafeReservation`
- 画面: `Dashboard`（`/view-json` へのリンクのみ）と `ViewJson`（dashboard と orders を JSON 表示）
- 変更検知: zone.js を使わない zoneless 構成
- テスト: `@angular/build:unit-test`（vitest + jsdom）

実装済みで、設計上前提にできる事実を次に挙げる。

- `angular-split@^20.0.0` は既に `package.json` にある。peerDependencies は `@angular/core >= 19` なので Angular 22 でそのまま使える。Phase 4 で新規追加する必要はない。
- `@ngrx/store@^22.0.1` と `@ngrx/effects@^22.0.1` は同リポジトリの `90_samples` で使用実績がある。この 2 つは `70_sweets-cafe-status` の `package.json` にまだ無い。
- `CafeSimulationStore` は `backendUpdateIntervalMs: 2000` で `advance()` を回し、API 呼び出しとは無関係に店内状態を 2 秒ごとに進める。`getDashboard()` は呼び出し時刻を基準にしたスナップショットを返す。
- `tableNumber` は `T01` 形式（`T` + 2 桁ゼロ埋め）。URL エンコードが必要な文字は含まない。
- `ViewJson` は HTTP と Signal に加えて `forkJoin` と `setInterval`（`dashboardUpdateIntervalMs: 60000`）による定期取得を持つ。「HTTP と Signal だけの最小例」ではない。

テーブル一覧、右ペイン、NgRx は未実装である。`ViewJson` は component から API を直接呼ぶ形の比較対象として現状のまま残す。

## 4. 画面構成

```text
app-root
└─ router-outlet
   └─ app-cafe-tables                      一覧ページと分割レイアウト
      └─ as-split
         ├─ as-split-area                 左側
         │  └─ app-cafe-tables-grid       一覧表
         └─ as-split-area                 右側。URL に tableNumber がある間だけ表示
            └─ router-outlet
               └─ app-cafe-table-output   詳細ペインの枠
                  ├─ app-cafe-info-header 閉じる操作と編集 UI
                  └─ router-outlet
                     └─ app-cafe-table-overview
```

ClearML との対応は次のように限定する。

| ClearML で読む箇所 | カフェ版 selector | カフェ版 class | 真似る点 |
| --- | --- | --- | --- |
| `sm-common-experiments` | `app-cafe-tables` | `CafeTables` | 一覧と右ペインの親 |
| `sm-experiments-table` | `app-cafe-tables-grid` | `CafeTablesGrid` | データを受け取り、行操作を通知 |
| `sm-experiment-output` | `app-cafe-table-output` | `CafeTableOutput` | 詳細の枠と子 `router-outlet` |
| `sm-experiment-info-header` | `app-cafe-info-header` | `CafeInfoHeader` | 選択対象の要約と編集 |

画面の分け方は対応させる。ClearML の機能数や基底 class の大きさは真似しない。

名前については、ClearML をそのまま持ち込まない点が 3 つある。

1. selector の接頭辞は `sm-` ではなく `app-` を使う。`angular.json` の `prefix` が `app` であり、既存の `app-dashboard` / `app-view-json` と揃える。ClearML との対応は上表で読む。
2. ファイル名とクラス名に `.component` / `Component` サフィックスを付けない。Angular 20 以降のスタイルガイドと、既存の `dashboard.ts` / `class Dashboard`、`view-json.ts` / `class ViewJson` に揃える。
3. 一覧表の component は `cafe-tables-table` にしない。この画面では「table」が店内テーブルと表 UI の両方を指すため、`cafe-tables-grid` として表 UI 側を区別する。

`output` は ClearML 由来の語で、カフェの業務用語としては意味を持たない。この資料では「詳細ペインの枠」以上の意味を与えない。

## 5. URL 仕様

| URL | 表示 | 選択状態 |
| --- | --- | --- |
| `/cafe-status` | 一覧のみ | なし |
| `/cafe-status/:tableNumber` | overview へリダイレクト | `tableNumber` を選択 |
| `/cafe-status/:tableNumber/overview` | 一覧＋右ペイン | `tableNumber` を選択 |

ルールを次のように固定する。

1. 行クリックは `/cafe-status/:tableNumber/overview` へ遷移する。
2. 右ペインの close は `/cafe-status` へ遷移する。
3. 選択中の行は URL の `tableNumber` だけから決める。`selectedTableNumber` を NgRx に保存しない。
4. 右ペインを表示するかどうかは、開閉 boolean ではなく URL に `tableNumber` セグメントがあるかで決める。
5. 右側の `router-outlet` を `@if` で囲わない。`as-split-area` の `[visible]` を使い、outlet は常にツリーへ置く。`@if` で囲うと、outlet が存在しないため子 route が活性化できず、右ペインが永久に開かない。「`router-outlet` の activate イベントで表示を決める」形も同じ理由で成立しない。
6. 存在しない `tableNumber` の場合も右ペインは開き、中に「テーブルが見つかりません」を表示する。自動で一覧へ戻さない。
7. 右ペインの中身は、選択テーブルの有無だけでなく取得状況も見て 3 状態に分ける。判定順は次に固定する。
   1. 該当行がある → 詳細を表示する。`loading` が `true` でも表示を続ける。
   2. 該当行が無く、`dashboard` が `null` または `loading` が `true` → 「読み込み中」を表示する。
   3. 該当行が無く、`dashboard` があり `loading` が `false` → not-found を表示する。

   1 を先に見るのは、手動再読み込みのたびに右ペインが「読み込み中」へ落ちて、中の component が破棄・再生成されるのを避けるためである。2 を分けないと、`/cafe-status/T01/overview` を直接開いた直後に必ず not-found が一瞬出る。
8. ブラウザの戻る/進むでも、行のハイライトと右ペインを URL に合わせる。
9. `tableNumber` は `T01` 形式で大文字小文字を区別する。`t01` は一致せず、ルール 6 の not-found になる。
10. `/cafe-status` 系のルートは `app.routes.ts` の `**` より前に置く。`**` は `/dashboard` へリダイレクトするため、後ろに置くと到達しない。

## 6. コンポーネントの責務

### `CafeTables`

- NgRx から一覧、読み込み中、エラー、取得時刻を読む。
- 初回表示時に `loadDashboard` を dispatch する。
- 再読み込み操作を `loadDashboard` の再 dispatch に変換する。
- 行選択を URL 遷移に変換する。
- `as-split` と右側の `router-outlet` を持つ。
- 表のセル表示と編集処理は持たない。
- Phase 4 で `BaseCafeEntityPage` を継承する。Phase 1〜3 では継承しない。

### `CafeTablesGrid`

- `input`: `tables`、`selectedTableNumber`
- `output`: `tableSelected`
- 行の描画、空データ表示、選択行の強調だけを行う。
- Router、Store、API は inject しない。
- 表示列は初期完成版で固定する。
  - テーブル番号
  - 分類
  - 状態
  - 人数
  - 会計金額
  - 現状態の経過時間

### `CafeTableOutput`

- URL の `tableNumber` と NgRx の一覧から選択中の `CafeTable` を導出する。
- 5 章ルール 7 に従い、「詳細」「読み込み中」「not-found」の 3 状態を出し分ける。詳細以外のときは子 `router-outlet` を描画しない。この `@if` は route の活性ではなく取得状況に依存するため、5 章ルール 5 の循環には当たらない。
- 選択テーブルを `CafeInfoHeader` へ渡す。
- `updateError` は `updateError.tableNumber` が選択中の `tableNumber` と一致するときだけ子へ渡す。
- `updateRequested` を `updateTable` action の dispatch に変換する。
- overview 用の子 `router-outlet` を持つ。
- 更新 API を直接呼ばない。
- Phase 4 で `BaseCafeTableOutput` を継承する。

### `CafeInfoHeader`

- `input`: `table`、`updating`、`updateError`
- `output`: `updateRequested`、`closeRequested`
- Reactive Forms で状態、人数、会計金額を編集する。
- 編集中かどうかは Signal、編集値とバリデーションは Form で持つ。
- Store、Router、API は inject しない。

### `CafeTableOverview`

- ActivatedRoute の親ルートから `tableNumber` を読み、NgRx の一覧から表示対象を導出する。
- 親が 5 章ルール 7 で「詳細」と判定したときだけ生成されるため、not-found と読み込み中の分岐は持たない。
- 選択テーブルの分類、経過時間、利用率、ステータス別時間を表示する。
- これらは取得時点のスナップショット値である。7 章の鮮度ルールに従い、基準時刻を併記する。
- action の dispatch と API 呼び出しは行わない。

## 7. 状態管理の固定ルール

同じ値を URL、NgRx、Signal の複数箇所に保存しない。正本は次のように固定する。

| 正本 | 保持する値 | 保持しない値 |
| --- | --- | --- |
| URL | 選択テーブル番号、詳細タブ | テーブル本体、ペイン開閉 boolean |
| NgRx | dashboard、読み込み状態、取得エラー、更新中の番号、更新エラー、分割比率 | 選択テーブル番号、フォーム入力値 |
| component の Signal/Form | 編集中、入力値、バリデーション表示 | API から取得した `CafeTable` |

NgRx feature state は初期完成版で次の形にする。

```ts
interface CafeStatusState {
  dashboard: CafeDashboard | null;
  loading: boolean;
  loadError: string | null;
  updatingTableNumber: string | null;
  updateError: { tableNumber: string; message: string } | null;
  splitPercent: number;
}
```

初期値は `dashboard: null`、`loading: false`、各 error と `updatingTableNumber` は `null`、`splitPercent: 65` とする。分割比率はアプリ起動中のみ保持し、localStorage へは保存しない。

`splitPercent` を NgRx に置くのは ClearML が `splitSize` を `experiments-view.reducer` に持つ形をそのまま読むためである。8 章の「将来使うかもしれないから置く」には当たらない。

`as-split` との接続は次の形に固定する。`unit` は既定の `percent` のまま使い、左の `as-split-area` に `[size]="splitPercent()"`、右に `[size]="100 - splitPercent()"` を渡す。`changeSplitPercent` は `dragEnd` から dispatch する。`dragEnd` の payload は `{ gutterNum, sizes: (number | '*')[] }` なので、`sizes[0]` が `number` のときだけ dispatch し、`'*'` は無視する。

必要な action も初期完成版では以下に限定する。

- `loadDashboard`
- `loadDashboardSuccess`
- `loadDashboardFailure`
- `updateTable`
- `updateTableSuccess`
- `updateTableFailure`
- `changeSplitPercent`

各 action の payload も固定する。`loadDashboardSuccess` は `{ dashboard }`、failure は `{ message }`、`updateTable` は `{ request }`、success は `{ table }`、failure は `{ tableNumber, message }`、`changeSplitPercent` は `{ splitPercent }` を持つ。

API 呼び出しは effect に限定する。

### 読み出しと effect の書き方

アプリは zoneless 構成なので、読み出し方も固定しておく。

1. 全 component に `ChangeDetectionStrategy.OnPush` を付ける。既存の `ViewJson` と揃える。
2. Store からの読み出しは `store.selectSignal()` に統一する。同じ画面で `async` pipe と signal を混在させない。
3. `withComponentInputBinding()` は `provideRouter()` に未設定である。route param を component の `input` で受け取れると仮定せず、`ActivatedRoute` から読む。設定を足す場合は、この資料を先に更新する。
4. `loadDashboard` の effect は `exhaustMap` を使い、応答前の再 dispatch を捨てる。再読み込みの連打を component 側のガードではなく effect で止める。既存の `ViewJson` が `if (this.loading()) return;` で行っている意図を、NgRx 側へ移す形になる。
5. `updateTable` の effect は `concatMap` を使う。`exhaustMap` にしない。同じフォームの二重送信は送信中 disabled で既に止まっており、`exhaustMap` が残り物として捨てるのは「送信中に別テーブルへ移って保存した」ケースになる。これは捨ててはいけない更新なので、直列に処理する。

### エラーの生存期間

エラーを Store に置く以上、消す条件も固定する。

1. `loadDashboard` の reducer で `loading: true`、`loadError: null` にする。
2. `updateTable` の reducer で `updatingTableNumber: request.tableNumber`、`updateError: null` にする。
3. `updateTableSuccess` / `updateTableFailure` の reducer は `updatingTableNumber` を無条件に `null` にしない。`table.tableNumber` または `action.tableNumber` が現在の `updatingTableNumber` と一致するときだけ `null` にする。更新が 2 件直列に走った場合、1 件目の応答で 2 件目のフォームの disabled が解けるのを防ぐ。
4. `updateError` は次の `updateTable` まで残る。右ペインを閉じて別テーブルを開いても Store 上は残るため、6 章のとおり表示側で `tableNumber` の一致を条件にする。
5. effect は `HttpErrorResponse` を文字列メッセージへ変換する。擬似バックエンドは 400（入力値不正）、404（テーブルが存在しない）、405（メソッド不正）を返すため、少なくとも 404 と 400 は区別できる文言にする。

### データの鮮度

擬似バックエンドは 2 秒ごとに店内状態を進める。初期完成版は定期ポーリングを行わないため、次の前提を画面仕様として受け入れる。

1. `stateElapsedSeconds`、`statusDurationsSeconds`、`dailyUsageRate`、`seats` は取得時点の値であり、放置しても進まない。
2. そのため `generatedAt` を一覧と右ペインに表示し、手動の再読み込みを置く。再読み込みは `loadDashboard` の再 dispatch で行い、専用 action は作らない。
3. 更新成功時は API が返した `CafeTable` で `dashboard.tables` の該当 1 件を置換し、全体の再取得は行わない。これは ClearML の更新パターンを読むための形である。
4. ルール 3 の結果、更新した 1 行だけが新しい時刻基準になり、他の行と基準時刻が揃わなくなる。これは既知の挙動として許容し、揃えたい場合は再読み込みで回復する。定期ポーリングを入れる段階で、この不整合ごと解消する。

更新失敗時は入力欄を閉じず、`dashboard` も変更しない。

`ViewJson` は学習用の比較対象として component から API を呼ぶ現状の形を保つ。新しい `/cafe-status` 画面にはその形を持ち込まない。

## 8. 継承の固定ルール

継承は ClearML の読解学習のために採用する。「将来使うかもしれない」という理由で基底 class を拡張しない。

### 許可する継承

```text
BaseCafeEntityPage
└─ CafeTables

BaseCafeTableOutput
└─ CafeTableOutput
```

継承はこの 2 組、2 段階までとする。ヘッダー、表、overview、inline-edit は継承させず、input/output と component 合成を使う。

### `BaseCafeEntityPage` に置いてよいもの

- Router と ActivatedRoute の inject
- URL から選択中の `tableNumber` を読む共通処理
- `openTable(tableNumber)`

次のものは置かない。

- 列定義、カフェの selector/action、API 呼び出し
- split 比率の保存、action の dispatch
- 検索、比較、複数選択、footer、権限判定
- 使われていない abstract メンバー

### `BaseCafeTableOutput` に置いてよいもの

- ActivatedRoute から `tableNumber` を読む処理
- Store の dashboard と `tableNumber` から選択テーブルを導出する処理
- `closePanel()`

次のものは置かない。

- フォーム定義、表示ラベル、カフェ固有の更新処理
- グラフ設定、最大化、breadcrumb、共有権限

基底 class は `DestroyRef` と `takeUntilDestroyed` を使い、`ngOnInit` / `ngOnDestroy` の呼び出し順に依存しない。子 class に `super.ngOnInit()` を要求するような、見えない契約は作らない。

次のいずれかに該当したら、基底 class に追加せず facade/service へ分離する。

- abstract メンバーが 3 個を超える
- 子が基底の機能を無効化する override が必要になる
- 画面に依存しない処理が基底 class に入り始める

## 9. 更新 UI のルール

1. 編集開始時に NgRx の現在値を Form へコピーする。
2. 人数は 0 以上の整数、会計金額は 0 以上の整数とする。擬似バックエンドは人数のみ整数を要求し、会計金額は 0 以上の数値であれば通すため、client 側が少し厳しい。この差は意図的に残す。
3. invalid または送信中は保存できない。
4. 保存時に `updateTable` を dispatch する。component から API を呼ばない。
5. 初期完成版で optimistic update は行わない。応答待ち中は対象フォームを disabled にする。
6. 成功時は API 応答で一覧と詳細を同時に更新し、編集を終了する。
7. 応答値が送信値と一致しない場合がある。`空き` 以外から `調理中` へ遷移すると、擬似バックエンドが注文を生成して `billingAmount` を再計算するため、送信した会計金額は無視される。UI は常に応答を正とし、送信値で画面を組み立てない。
8. 失敗時は入力値を残し、ヘッダー内に再試行可能なエラーを表示する。404 の場合は「このテーブルは存在しない」と読めるようにし、再読み込みを促す。

`CafeTable` に表示名のフィールドはない。そのため初期完成版で `sm-inline-edit` に相当する部品は作らない。実在しない「テーブル名」は UI に追加しない。inline-edit を学習対象にする際は、先にモデル、API、擬似バックエンドの変更案を別フェーズとして定義する。

## 10. 配置

```text
src/app/
├─ core/
│  ├─ api/                              既存の HTTP 境界
│  ├─ backend/                          既存の擬似バックエンド
│  └─ model/                            既存の API モデル
├─ feature/
│  └─ cafe-status/
│     ├─ cafe-status.routes.ts
│     ├─ containers/
│     │  ├─ cafe-table-output/
│     │  └─ cafe-table-overview/
│     └─ state/
│        ├─ cafe-status.actions.ts
│        ├─ cafe-status.effects.ts
│        ├─ cafe-status.reducer.ts
│        └─ cafe-status.selectors.ts
└─ webapp-common/
   ├─ cafe-tables/
   │  ├─ cafe-tables.ts / .html / .scss
   │  ├─ containers/
   │  │  └─ cafe-table-output/
   │  │     └─ base-cafe-table-output.ts
   │  └─ dumb/
   │     ├─ cafe-tables-grid/
   │     └─ cafe-info-header/
   └─ shared/
      └─ entity-page/
         └─ base-cafe-entity-page.ts
```

`webapp-common` は ClearML と配置を比較するために使う。ただし、Store と Router を知らない表示部品だけを `dumb/` に置く。

2 つの基底 class の置き場所は ClearML に合わせる。

- `base-cafe-entity-page.ts` は `webapp-common/shared/entity-page/` に置く。ClearML の `webapp-common/shared/entity-page/base-entity-page.ts` に対応する。画面種別に依存しない基底なので `shared` 側が正しい。
- `base-cafe-table-output.ts` は `webapp-common/cafe-tables/containers/cafe-table-output/` に置く。ClearML の `webapp-common/experiments/containers/experiment-ouptut/base-experiment-output.component.ts` に対応する。テーブル詳細に固有の基底なので `shared` には置かない。

state の置き場所は ClearML と変える。ClearML は `webapp-common/experiments/` の下に `actions` / `reducers` / `effects` を分けて持つが、ここでは初期完成版の規模に合わせて `feature/cafe-status/state/` にまとめる。この差は意図的なものとして扱う。

## 11. 実装順序と各段階の完了条件

### Phase 1: Signal で一覧を描画

実装:

- `/cafe-status` と `CafeTables` を追加する。ルートは `**` より前に登録する。
- component から `getDashboard()` を呼び、Signal で一覧を描画する。
- `generatedAt` の表示と再読み込みボタンを置く。
- Dashboard から `/cafe-status` へのリンクを追加する。あわせて `/cafe-status` と `/view-json` の相互リンクも置く。`AGENTS.local.md` の「Dashboard から全 feature、feature 内の相互リンク」に従う。

完了条件:

- 読み込み中、空データ、エラー、通常表示を `@if` で分けられる。
- テーブル全件が固定 6 列で表示される。
- 再読み込みで `generatedAt` と経過時間が進む。

### Phase 2: 表を input/output で分離

実装:

- `CafeTablesGrid` を追加する。
- 親はデータ取得、子は描画と行選択通知を担当する。

完了条件:

- 子 component が API、Store、Router のいずれにも依存していない。
- vitest の component test で input の描画と `tableSelected` の発火を確認できる。

### Phase 3: NgRx へ移行

実装:

- `@ngrx/store@^22.0.1` と `@ngrx/effects@^22.0.1` を追加する。
- state、actions、reducer、selectors、effects を追加する。
- `app.config.ts` で `provideStore()` を登録する。
- `/cafe-status` の親 route で `provideState` と `provideEffects` を登録し、一覧と全子 route で同じ feature state を使う。
- effect で `HttpErrorResponse` をメッセージへ変換する。
- Phase 1 で作った component 直接の API 呼び出しと再読み込み処理を、`loadDashboard` の dispatch へ置き換える。

完了条件:

- `loadDashboard` から success/failure までを effect test で確認できる。
- API を呼ぶ component が `ViewJson` 以外にない。
- `loadDashboard` の再 dispatch で `loadError` が消える。

### Phase 4: URL 連動の右ペイン

実装:

- 2 つの基底 class を追加し、`CafeTables` と `CafeTableOutput` を継承へ切り替える。
- 既存依存の `as-split` で分割レイアウトを組み、子ルートと右ペインを追加する。右側は `@if` ではなく `as-split-area` の `[visible]` で出し分け、`router-outlet` は常にツリーへ置く。
- `CafeTableOutput`、`CafeInfoHeader`、`CafeTableOverview` を追加する。
- `changeSplitPercent` を `dragEnd` と reducer に接続する。

完了条件:

- URL 直接入力、行クリック、close、戻る/進むで同じ選択結果になる。
- 右ペインの開閉用 boolean を持たず、URL の `tableNumber` の有無だけで表示が決まる。
- `/cafe-status/T01/overview` を直接開いたとき、読み込み中は「読み込み中」が出て、not-found が一瞬も出ない。
- 存在しない番号と、`t01` のような大小違いで not-found 表示になる。
- 一覧と右ペインが同じ selector 系のデータを参照する。
- gutter をドラッグして離すと `splitPercent` が更新され、以後の再描画でも比率が保たれる。

### Phase 5: 編集とエラー処理

実装:

- `CafeInfoHeader` に Reactive Forms を追加する。
- `updateTable` の action/effect/reducer を実装する。effect は `concatMap`、reducer は応答と `updatingTableNumber` の一致判定を入れる。
- `updateError` の `tableNumber` 一致判定を `CafeTableOutput` に入れる。

完了条件:

- 成功時に一覧行と右ペインが同時に更新される。
- `調理中` への遷移で、送信した会計金額ではなく応答の値が表示される。
- 失敗時に Store のテーブルが書き換わらず、入力値とエラー表示が残る。
- 失敗後に別テーブルを開いても、そのテーブルにエラーが表示されない。
- 送信中の二重送信を防げる。
- 送信中に別テーブルへ移って保存しても、後の 1 件が捨てられず、先の応答で後のフォームの disabled が解けない。

## 12. 初期完成版の受け入れ条件

1. Dashboard から `/cafe-status` を開け、`/cafe-status` と `/view-json` を相互に行き来できる。
2. `/cafe-status` で読み込み、エラー、空、通常の 4 状態を表示できる。
3. 行クリックで `/cafe-status/:tableNumber/overview` へ遷移し、右ペインが開く。
4. URL 直接入力と戻る/進むで、右ペインと行選択が一致する。読み込み中に not-found が出ない。
5. 存在しない番号でも右ペインが開き、not-found を表示して一覧へ戻らない。
6. close で `/cafe-status` へ戻り、行選択も解除される。
7. 状態、人数、会計金額を更新でき、一覧と詳細が同じ値になる。
8. `generatedAt` が表示され、再読み込みで全行の経過時間が揃って進む。
9. 選択は URL、API データは NgRx、編集中の値は Form/Signal が正本になっている。
10. 一覧表、ルート連動、reducer、effect、更新成功/失敗の自動テストが vitest で通る。

## 13. 初期完成後の追加候補

初期完成版の受け入れ条件を満たすまで、以下は実装しない。

1. orders タブと `getOrders()` の NgRx 化
2. reservations タブと予約追加フォーム
3. `clearTable()` による会計・退店操作
4. モデル/API/擬似バックエンドを拡張した上での inline-edit
5. 定期ポーリングと、編集中のデータを上書きしない競合ルール。7 章の鮮度ルール 4 が残す基準時刻のズレも、ここで解消する
6. 動的列、フィルター、遅延ロード
7. `@ngrx/store-devtools` の導入
