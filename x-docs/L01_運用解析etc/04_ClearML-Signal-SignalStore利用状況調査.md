# ClearML における Signal / SignalStore 利用状況調査

調査日: 2026-09-18

## 0. 調査対象と前提

| 項目 | 内容 |
|---|---|
| 対象リポジトリ | `/Users/yasu/work/mergelog/learn-ClearML-pro`（ClearML Web の fork、package name `stackup`） |
| fork 元 | `https://github.com/clearml/clearml-web.git` tag `v2.5` (v2.5.0) |
| Angular | `@angular/core` ^22.1.5 |
| NgRx | `@ngrx/store` `@ngrx/effects` `@ngrx/signals` `@ngrx/component` `@ngrx/entity` `@ngrx/router-store` `@ngrx/operators` すべて ^22.0.0 |
| 補助 | `@angular-architects/ngrx-toolkit`（`withDevtools`） |

### 母数

| 母数 | 件数 |
|---|---|
| `.ts` 全体 | 1,569 |
| うち spec | 78 |
| プロダクションコード `.ts` | 1,491 |
| うち自動生成 API モデル `app/business-logic/model/**` | 584 |
| 手書き相当 `.ts`（= 1,491 − 584） | 約 907 |
| Component (`*.component.ts`) | 348 |
| Directive (`*.directive.ts`) | 36 |
| Service (`*.service.ts`) | 58 |
| テンプレート `.html` | 335 |
| `.ts` 行数（spec 除く） | 111,244（生成モデル除くと 93,702） |

> 計測した Signal 系 API の宣言は **spec ファイルには 1 件も存在しない**（全 78 spec で 0 件）。以下の数値はすべてプロダクションコード。

---

## 1. 結論（要約）

| 技術 | 採用度 | 一言 |
|---|---|---|
| **Angular Signal（`signal` / `computed` / `input` / `output` 等）** | ★★★★★ 事実上の標準 | コンポーネント I/O とビュー層はほぼ Signal に移行済み。`@Input`/`@Output` は残骸レベル |
| **`store.selectSignal()`（NgRx Store → Signal 橋渡し）** | ★★★★☆ 主要導線 | 303 箇所 / 99 ファイル。グローバル状態を Signal 化する実質的な本線はここ |
| **SignalStore（`@ngrx/signals`）** | ★☆☆☆☆ 点在する試験導入 | `signalStore()` はわずか **3 個**。全体の 0.6% 未満。局所状態の実験場 |
| **Classic NgRx Store（Redux）** | ★★★★★ 依然として主役 | 343 ファイルが `@ngrx/store` を import。feature state 27、reducer 49、effects 41 |

一言でまとめると **「ビュー層 = Signal 全面採用、状態管理層 = Classic NgRx のまま、SignalStore は 3 箇所の先行実験」**。

---

## 2. Angular Signal（`@angular/core`）の利用状況

### 2.1 API 別の件数

`signalAPI を import しているファイル数` と `宣言・呼び出し箇所` の両方を計測。

| API | ファイル数 | 宣言/呼び出し数 | 備考 |
|---|---:|---:|---|
| `input()` / `input.required()` | 194 | **933** | 最多。`input.required` は 19 |
| `output()` | 128 | **386** | |
| `computed()` | 143 | **344** | |
| `signal()` | 91 | **171** | |
| `effect()` | 82 | **150** | 要レビュー対象（後述 §6） |
| `viewChild()` / `viewChildren()` | 71 / 7 | **109** | |
| `toSignal()` | 32 | 43 | `@angular/core/rxjs-interop` |
| `toObservable()` | 16 | 20 | 同上 |
| `untracked()` | 12 | 17 | |
| `linkedSignal()` | 12 | 14 | Angular 19+ の新 API。採用済み |
| `model()` | 9 | 10 | |
| `contentChild()` / `contentChildren()` | 2 / 2 | 4 | |
| `rxResource()` | 1 | 1 | `project-workloads/workloads-page` のみ |
| `resource()` | 0 | 0 | **未使用** |

**Signal 系 API に触れているファイル: 299**
- 対 プロダクション全 `.ts` 1,491 → **20.1%**
- 対 手書き相当 907 → **33.0%**（生成モデル 584 は当然 0 件なので、こちらが実感に近い）

### 2.2 コンポーネント単位の移行率（348 component）

| 観点 | 件数 | 比率 |
|---|---:|---:|
| Signal input (`= input(...)`) を持つ | **185** | 53.2% |
| `@Input()` を持つ | 33 | 9.5% |
| 両方を持つ（移行途中） | 6 | 1.7% |
| そもそも input を持たない（ページ/コンテナ系） | 136 | 39.1% |
| **input を持つ component 内での Signal 化率** | **185 / 212** | **87.3%** |
| | | |
| Signal output (`= output(...)`) を持つ | **124** | 35.6% |
| `@Output()` を持つ | 30 | 8.6% |
| 両方 | 6 | 1.7% |
| output を持たない | 200 | 57.5% |
| **output を持つ component 内での Signal 化率** | **124 / 148** | **83.8%** |
| | | |
| `ChangeDetectionStrategy.OnPush` | 240 | 69.0% |
| `ChangeDetectionStrategy.Default` 明示 | 1 | 0.3% |
| ローカル `signal()` を持つ | 84 | 24.1% |
| `computed()` を持つ | 125 | 35.9% |
| `effect()` を持つ | 77 | 22.1% |
| `@ngrx/store` を import | 120 | 34.5% |
| `store.selectSignal()` を使用 | 92 | 26.4% |
| `toSignal()` を使用 | 26 | 7.5% |

### 2.3 Directive は移行が遅れている

| 対象 | Signal input | `@Input()` |
|---|---:|---:|
| Directive (36 個) | **6** | **19** |

`@Input` が残っている 57 ファイルの内訳を見ると、過半が **directive / validator 系**（`template-forms-ui/*.directive.ts` の各種バリデータ、`tooltip.directive.ts`、`overflows.directive.ts` など）。component 側の移行は終わっているが、**directive 層が積み残し**になっている。

### 2.4 Signal 密度が高いファイル TOP10

| 件数 | ファイル |
|---:|---|
| 63 | `webapp-common/shared/ui-components/data/table/table.component.ts` |
| 60 | `webapp-common/shared/experiment-graphs/experiment-graphs.component.ts` |
| 46 | `webapp-common/experiments/dumb/experiments-table/experiments-table.component.ts` |
| 40 | `webapp-common/models/shared/models-table/models-table.component.ts` |
| 39 | `webapp-common/dashboard-search/search-results-table/search-results-table.component.ts` |
| 30 | `webapp-common/serving/serving-table/serving-table.component.ts` |
| 28 | `webapp-common/experiments/dumb/experiment-header/experiment-header.component.ts` |
| 27 | `webapp-common/shared/ui-components/data/table/table-filter-sort/table-filter-sort.component.ts` |
| 25 | `webapp-common/experiments-compare/.../select-experiments-for-compare.component.ts` |
| 24 | `webapp-common/shared/ui-components/panel/menu/menu.component.ts` |

汎用テーブル基盤（`table.component.ts`）とグラフ基盤が最も Signal 化されている。共通 UI 部品から移行が進んだ形跡。

---

## 3. SignalStore（`@ngrx/signals`）の利用状況

### 3.1 全量（これで全部）

`@ngrx/signals` を import しているファイルは **9 個のみ**。

| # | ファイル | 行数 | 役割 |
|---|---|---:|---|
| 1 | `webapp-common/core/state/view.events.ts` | 32 | `eventGroup` 定義（共通 view イベント） |
| 2 | `webapp-common/core/state/view.store.ts` | 62 | `signalStoreFeature` = `withViewBridge()`（**Store 橋渡し**） |
| 3 | `webapp-common/experiments/containers/experiment-output-log/experiment-output-log.store.ts` | 181 | `signalStore()` = `ExperimentOutputLogStore` |
| 4 | `webapp-common/experiments/containers/experiment-output-log/experiment-output-log.component.ts` | 162 | 上を `providers:[]` で利用 |
| 5 | `webapp-common/experiments-compare/.../select-task-store.ts` | 383 | `signalStore()` = `selectTaskStore` |
| 6 | `webapp-common/experiments-compare/.../table-store.ts` | 279 | `signalStoreFeature` = `withTableStore()` |
| 7 | `webapp-common/experiments-compare/.../select-experiments-for-compare.component.ts` | 370 | 上 2 つを利用 |
| 8 | `webapp-common/shared/project-dialog/project-settings/project-settings-dialog.store.ts` | 48 | `signalStoreFeature` = `withProjectSettingsStore` |
| 9 | `features/dashboard-search/project-settings-dashboard-search-permissions.store.ts` | 11 | `signalStore()` = `ProjectSettingsStore` |

### 3.2 API 別

| API | 使用箇所 |
|---|---:|
| `signalStore()` | **3** |
| `signalStoreFeature()` | **3** |
| `withState()` | 4 |
| `withComputed()` | 3 |
| `withMethods()` | 2 |
| `patchState()` | 2（1 ファイル） |
| `withHooks()` | **0** |
| `withProps()` | **0** |
| `withEntities()` | **0** |
| `signalState()` | **0** |
| `deepComputed()` | **0** |
| `signalMethod()` | **0** |
| `withLinkedState()` | **0** |
| `@ngrx/signals/entities` | **0**（import すら無し） |
| `@ngrx/signals/events`（`eventGroup` / `on` / `withReducer` / `withEventHandlers` / `Events` / `Dispatcher`） | **7 ファイル** |
| `withDevtools`（`@angular-architects/ngrx-toolkit`） | 3（2 store + `environments/base.ts`） |

**→ 全体の 0.6%（9 / 1,491）。コンポーネント換算では 348 中 2 個しか SignalStore を注入していない。**

### 3.3 `withEntities` は 1 件も無い（※着目点）

- `@ngrx/signals/entities` の import は **ゼロ**
- 対になる Classic 側の `@ngrx/entity` も **package.json に宣言されているだけで使用箇所ゼロ**（`createEntityAdapter` 0 件）

つまり ClearML はコレクション状態を **entity adapter を使わず、素の配列 + reducer** で管理している。SignalStore に移行するにしても `withEntities` の受け皿が無い状態。

### 3.4 使い方の特徴 ― 「Redux をそのまま SignalStore に載せている」

3 つの `signalStore()` はいずれも **Component `providers:[]` でスコープされたローカルストア**（グローバル状態ではない）。

```ts
// experiment-output-log.component.ts
providers: [ExperimentOutputLogStore],
protected readonly logStore = inject(ExperimentOutputLogStore);
```

そして中身が特徴的で、**イディオマティックな SignalStore（`withMethods` + `patchState`）ではなく、実験的な `@ngrx/signals/events` プラグインで Redux 構造を再現**している。

```ts
// experiment-output-log.store.ts
export const ExperimentOutputLogStore = signalStore(
  withState(initialState),
  withViewBridge(),                 // ← グローバル Store への橋渡し
  withDevtools('consoleLog'),
  withComputed((state) => ({ ... })),
  withReducer(                      // ← @ngrx/signals/events。reducer をそのまま持ち込み
    on(experimentOutputLogEvents.resetLog, () => ({...})),
    ...
  ),
);
```

`eventGroup()` で action 群を宣言し、`withReducer(on(...))` で reducer、`withEventHandlers()` で effects 相当 ―― **Classic NgRx の action/reducer/effect の三点セットを、そのままの構造で SignalStore に写している**。
`patchState` が 2 箇所しか無いのはこのため（命令的更新をほぼ使っていない）。

### 3.5 `withViewBridge()` ＝ 共存のための橋

最重要の設計ポイント。`view.store.ts` は SignalStore のイベントを受けて **グローバル NgRx Store に `dispatch` し直す** feature。

```ts
export function withViewBridge() {
  return signalStoreFeature(
    withEventHandlers((store, events = inject(Events), globalStore = inject(Store)) => ({
      serverErrorMoreInfo: events.on(viewEvents.setServerError).pipe(
        map(({payload: action}) => { globalStore.dispatch(setServerError(...)); }),
      ),
      addMessage:      events.on(viewEvents.addMessage).pipe(...globalStore.dispatch(addMessage(...))),
      requestFailed:   events.on(viewEvents.requestFailed).pipe(...),
      activateLoader:  events.on(viewEvents.activateLoader).pipe(...),
      deactivateLoader:events.on(viewEvents.deactivateLoader).pipe(...),
    })),
  );
}
```

ローディング表示・エラー通知・トーストといった**横断的関心事は依然としてグローバル Store 側にある**ため、SignalStore 側からそこへ抜ける経路を用意している。
= **「SignalStore は局所状態だけ担当し、横断関心事は Classic Store に委譲する」** という明確な棲み分け設計。

---

## 4. Classic NgRx（比較対象）

SignalStore の少なさを相対化するための数値。

| 項目 | 件数 |
|---|---:|
| `@ngrx/store` を import するファイル | **343** |
| `provideState()`（feature state 数） | **27** |
| `*.reducer.ts` / `*-reducer.ts` | 49 |
| `*.effects.ts` | 41 |
| `*.actions.ts` | 48 |
| `createAction*()` | **615** |
| `createSelector()` | **481** |
| `createReducer()` | 82 |
| `createEffect()` | **290** |
| `store.select(...)`（Observable） | **928** |
| `store.selectSignal(...)`（Signal） | **303**（99 ファイル） |
| `StoreModule.forFeature` | 0（全て standalone `provideState` 化済み） |

`select` : `selectSignal` ＝ **約 3 : 1**。Signal 化は進んでいるが、Observable 経路がまだ多数派。

---

## 5. テンプレート層の実態

| 項目 | 件数 |
|---|---:|
| `.html` テンプレート | 335 |
| `\| async` | **6**（3 ファイル） |
| `ngrxPush`（`@ngrx/component` の PushPipe） | **370**（60 ファイル） |

`| async` はほぼ絶滅しているが、**`ngrxPush` に置き換わっただけで Observable バインディングは 370 箇所残っている**。
「テンプレートが全部 Signal になった」わけではない点は注意。Signal 直接バインディング（`foo()`）+ `ngrxPush` + わずかな `async` の三層混在。

### Zoneless

| 対象 | 状態 |
|---|---|
| メインアプリ（`stackup`） | **zone.js 有効**（`polyfills.ts` で `import 'zone.js'`、`angular.json` の polyfills にも登録） |
| サブアプリ `report-widgets` | `provideZonelessChangeDetection()` 済み |

Signal 化は進んでいるが、**本体はまだ zoneless に到達していない**。Signal 採用の最大の見返り（zoneless 化）はこれから。

---

## 6. 領域別の分布

主要領域のみ抜粋（`(other)` は自動生成 API モデル 584 件が大半）。

| 領域 | ファイル数 | Signal API | @ngrx/signals | @ngrx/store |
|---|---:|---:|---:|---:|
| `webapp-common/shared` | 332 | **119** | 1 | 71 |
| `webapp-common/experiments` | 74 | 26 | 2 | 40 |
| `webapp-common/experiments-compare` | 53 | 9 | **3** | 30 |
| `webapp-common/core` | 33 | 0 | 2 | 24 |
| `webapp-common/models` | 33 | 17 | 0 | 21 |
| `webapp-common/dashboard-search` | 20 | **16** | 0 | 5 |
| `webapp-common/workers-and-queues` | 21 | 9 | 0 | 14 |
| `features/data-catalog` | 20 | 7 | 0 | 7 |
| `webapp-common/settings` | 15 | 11 | 0 | 9 |
| `webapp-common/layout` | 13 | 7 | 0 | 9 |
| `features/dashboard-search` | 5 | 1 | **1** | 2 |
| `(other)`（生成モデル等） | 652 | 1 | 0 | 22 |

- **`webapp-common/shared`（共通 UI 部品）が Signal 化の震源地**（119 ファイル）。
- **`webapp-common/core`（グローバル状態の中枢）は Signal API 使用 0**。ここが Classic NgRx の牙城。
- SignalStore は `experiments-compare` と `experiments/output-log` の 2 機能に集中。

---

## 7. 所見・レビュー観点

### 7.1 Signal 採用の評価

- コンポーネント I/O の Signal 化率 **87%（input）/ 84%（output）** は非常に高く、Angular 22 世代として適切。
- `linkedSignal()` を 12 ファイルで採用しており、新 API へのキャッチアップも早い。
- 一方 **`resource()` 未使用・`rxResource()` 1 件のみ**。非同期データ取得は依然 NgRx Effects 経由で、Signal ベースのデータ取得には踏み込んでいない。

### 7.2 懸念点

| # | 懸念 | 根拠 |
|---|---|---|
| 1 | **`effect()` 150 箇所は多い** | `effect()` は同期用の最終手段。`computed` / `linkedSignal` で表現できるものが混ざっている可能性が高い。77 component が `effect` を持つ＝ 4.5 component に 1 つ。要棚卸し |
| 2 | **Directive 層が置き去り** | 36 directive 中 Signal input は 6、`@Input` は 19。バリデータ系が特に古い |
| 3 | **テンプレートの `ngrxPush` 370 箇所** | `| async` は消えたが Observable バインディングは残存。zoneless 化の前に `selectSignal` へ寄せる必要 |
| 4 | **`select` : `selectSignal` = 928 : 303** | Signal 化の本線が `selectSignal` なのに、まだ Observable 経路が 3 倍。移行が中途 |
| 5 | **SignalStore が Redux のまま移植されている** | `withReducer` / `eventGroup` / `withEventHandlers` 中心で、`withMethods` + `patchState` はほぼ未使用。SignalStore の簡潔さという利点を享受できていない。逆に言えば **Classic からの機械的移行パスの検証**としては筋が良い |
| 6 | **`@ngrx/signals/events` は実験的 API** | 3 store すべてが依存。上流 API が変わると影響を受ける。fork 側で追随判断が必要 |
| 7 | **`@ngrx/entity` が dead dependency** | package.json に宣言されているが使用箇所 0。`withEntities` も 0。削除候補 |
| 8 | **本体が zone.js のまま** | Signal 投資の回収（zoneless）が未達 |

### 7.3 移行ロードマップとしての読み方

現状は「**Signal 化フェーズ 1（ビュー層）完了 → フェーズ 2（状態層）着手直後**」と読める。

```
[完了]   コンポーネント I/O        : @Input/@Output → input()/output()   87%
[完了]   ビューのクエリ            : @ViewChild → viewChild()             109 箇所
[進行中] グローバル状態の読み取り  : store.select → store.selectSignal    25%（303/1231）
[進行中] テンプレート              : | async → ngrxPush → signal          ngrxPush 370 残
[着手]   ローカル状態              : Component 状態 → SignalStore          3 store のみ
[未着手] グローバル状態の書き込み  : Classic Store のまま                  27 feature state 全部
[未着手] 非同期データ取得          : Effects のまま                        rxResource 1 件
[未着手] zoneless                  : zone.js 有効                          report-widgets のみ済
```

---

## 8. 調査コマンド（再現用）

```bash
SRC=/Users/yasu/work/mergelog/learn-ClearML-pro/src

# Signal 宣言数
grep -rohPe "=\s*input(\.required)?\s*[(<]"  --include="*.ts" $SRC | wc -l   # 933
grep -rohPe "=\s*output\s*[(<]"              --include="*.ts" $SRC | wc -l   # 386
grep -rohPe "=\s*computed\s*[(<]"            --include="*.ts" $SRC | wc -l   # 344
grep -rohPe "=\s*signal\s*[(<]"              --include="*.ts" $SRC | wc -l   # 171
grep -rohPe "(?<![\w\$.])effect\s*\("        --include="*.ts" $SRC | wc -l   # 150

# SignalStore
grep -rl  "@ngrx/signals"   --include="*.ts" $SRC            # 9 ファイル
grep -roh "signalStore("    --include="*.ts" $SRC | wc -l    # 3
grep -rn  "withEntities"    --include="*.ts" $SRC            # 0

# Classic NgRx
grep -rl  "from '@ngrx/store'" --include="*.ts" $SRC | wc -l # 343
grep -roh "createSelector("    --include="*.ts" $SRC | wc -l # 481
grep -roh "\.select("          --include="*.ts" $SRC | wc -l # 928
grep -roh "selectSignal("      --include="*.ts" $SRC | wc -l # 303

# テンプレート
grep -roh "ngrxPush"  --include="*.html" $SRC | wc -l        # 370
grep -rohE "\| *async" --include="*.html" $SRC | wc -l       # 6
```

※ macOS 標準 `grep` は `-P` 非対応。`grep -P` が必要な箇所は GNU grep（`ggrep`）または上記スクリプトの Node 版を使用。
