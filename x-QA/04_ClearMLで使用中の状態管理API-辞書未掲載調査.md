# ClearML で使われているが逆引き辞書に載っていない状態管理 API 調査

対象辞書: [../x-docs/00_70_逆引き-状態管理.md](../x-docs/00_70_逆引き-状態管理.md)
調査対象: `/Users/yasu/work/mergelog/learn-ClearML-pro/src`（`*.ts` 1,569 本 + テンプレート）

## 調査方法

- `src` 配下の全 `*.ts` から `rxjs` / `rxjs/operators` / `rxjs/fetch` / `@ngrx/*` / `@angular/core` / `@angular/core/rxjs-interop` / `@angular/common/http` の **import 識別子を機械抽出**し、シンボル別の「import しているファイル数」を集計
- テンプレート（`*.html`）は pipe 使用を `grep` で集計
- 集計結果を辞書本文の語（完全一致）と突き合わせ、**辞書に項目がない／名前すら出てこない**ものを抽出
- 数値はすべて「そのシンボルを import しているファイル数」。テンプレート pipe のみ出現回数

バージョンは辞書の前提（Angular 22.1 / RxJS 7.8 / NgRx 22）と一致（ClearML: Angular 22.1.5 / RxJS 7.8.2 / NgRx 22.0.0）。**バージョン差による未掲載ではなく、純粋な守備範囲の差**です。

## 結論サマリ

未掲載は大きく 5 系統あります。

| # | 系統 | 重要度 | 代表例 |
| --- | --- | --- | --- |
| 1 | **Observable をテンプレートへ出す pipe** | 最大 | `ngrxPush`（370 箇所）、`async`（6 箇所） |
| 2 | Observable の**生成関数**（`[func]`） | 大 | `fromEvent` `interval` `timer` `throwError` `iif` `fromFetch` |
| 3 | 辞書に無い**operator** | 中 | `skip` `expand` `reduce` `takeUntil` `takeWhile` `auditTime` `distinctUntilKeyChanged` `debounce` `pairwise` `bufferTime` `toArray` `retryWhen` |
| 4 | NgRx Store の**Action 定義・feature 登録・provider 系** | 大 | `createAction` `props` `createActionGroup` `createFeature` `createFeatureSelector` `provideStore/State/Effects` `MetaReducer` |
| 5 | SignalStore Events の**発火側**と拡張 | 中 | `eventGroup` `injectDispatch` `Dispatcher` `signalStoreFeature` `withDevtools` |

辞書は「どの API で状態を組むか」の選択指針としてはほぼ埋まっていますが、**「作る（生成）」「配る（Action/provider）」「出す（テンプレート）」の 3 工程が薄い**、というのが全体像です。

---

## 1. テンプレートへ出す pipe（辞書に記載ゼロ）

| pipe | 出現 | 供給元 |
| --- | ---: | --- |
| `ngrxPush` | **370** | `@ngrx/component` の `PushPipe`（60 ファイルが import） |
| `async` | 6 | `@angular/common` `AsyncPipe` |

```html
<!-- src/app/app.component.html:16 -->
<sm-header [isLogin]="loginContext | ngrxPush"></sm-header>
```

辞書には「Observable → Signal」（`toSignal`）の行はありますが、**「Observable → テンプレート表示」の行が 1 つも無い**のが最大の欠落です。ClearML は `async` ではなく `ngrxPush` を既定にしており、これは zoneless / OnPush 前提で `markForCheck` を自前で呼ぶ NgRx 製 pipe です（実際 report-widgets 側は `provideZonelessChangeDetection()` を使用）。辞書の「変換」大分類に 1 行追加する価値があります。

補足: ClearML の Observable 表示は `toSignal`（32 ファイル）と `ngrxPush`（60 ファイル）が併存しており、**移行途上**の状態です。

## 2. Observable の生成関数（`[func]`）

辞書の RxJS 欄は `combineLatest` / `forkJoin` / `zip` / `merge` / `concat` という **合流系の func しか扱っていません**。ClearML が実際に使う「源流を作る func」は以下です。

| シンボル | ファイル数 | 辞書 | 代表箇所 |
| --- | ---: | --- | --- |
| `Observable`（型） | 75 | 概念のみ | 全域 |
| `of` | 55 | 例中のみ | 全域 |
| `Subscription` | 33 | **無** | `global-search-filter.component.ts:63`（`new Subscription()` に `add` で束ねる手動管理） |
| `fromEvent` | 17 | **無** | `side-nav.component.ts:45` `toSignal(fromEvent(window,'resize'))` |
| `EMPTY` | 16 | 言及のみ | Effects の打ち切り |
| `interval` | 13 | **無** | `serving-stats.component.ts:98` 定期リフレッシュ |
| `Subject` | 11 | 言及のみ | `refresh.service.ts` 等のイベントハブ |
| `from` | 8 | **無** | Promise/配列からの変換 |
| `timer` | 7 | **無** | `quality-pipeline.effects.ts:214` `timer(0, REFRESH_INTERVAL_MS)` |
| `throwError` | 5 | **無** | `webapp-interceptor.ts:32` `throwError(() => err)` |
| `iif` | 4 | **無** | `serving.effects.ts:63` `concatLatestFrom((action) => iif(...))` で参照先 selector を出し分け |
| `fromFetch` | 4 | **無** | `base-admin.service.ts:201`、`experiment-output-log.store.ts`（`rxjs/fetch`。`HttpClient` を通さない直 fetch） |
| `lastValueFrom` | 2 | **無** | `project-settings-dialog.store.ts:39`（`await lastValueFrom(forkJoin([...]))`） |
| `firstValueFrom` | 1 | **無** | テストコード |

特に指摘したい 3 点:

- **`iif` + `concatLatestFrom`**: 辞書の `concatLatestFrom` 項は「factory を遅延評価する」と説明していますが、ClearML はその遅延評価性を `iif` で **Action 種別ごとに参照 selector を切り替える**ために使っています。辞書の説明の実例として噛み合うので、`concatLatestFrom` 項に追記すると理解が深まります。
- **`Subscription` の手動管理（33 ファイル）**: 辞書は購読管理を `takeUntilDestroyed` 一本で説明していますが、実コードでは `sub = new Subscription()` + `sub.add()` + `ngOnDestroy` で `unsubscribe()` する旧来型が広く残っています。`takeUntilDestroyed`（61 ファイル）との併存状況は「移行の現実」として書き添える価値あり。
- **`lastValueFrom` / `firstValueFrom`**: Observable → Promise の出口。辞書は Signal 方向（`toSignal`）しか扱っていません。

## 3. 辞書に無い operator

### 3-1. 完全未掲載

| operator | ファイル数 | 用途 | 代表箇所 |
| --- | ---: | --- | --- |
| `skip` | 10 | 初回値を捨てる | `serving-loading.component.ts:146` `skip(1)` |
| `expand` | 6 | **再帰的ページング**（全件取得まで次ページを自己再帰） | `common-experiments-view.effects.ts:678` |
| `reduce` | 6 | expand の結果を最後に 1 本へ畳む | `common-experiment-output.effects.ts:72` |
| `pairwise` | 5 | 前回値と今回値の組 | `experiment-execution-source-code.component.ts:128` |
| `takeUntil` | 4 | **Action でポーリング停止** | `quality-pipeline.effects.ts:218` `takeUntil(actions.pipe(ofType(leavePage)))` |
| `distinctUntilKeyChanged` | 4 | キー単位の同値抑制 | `experiment-output-plots.component.ts:165` `distinctUntilKeyChanged('id')` |
| `auditTime` | 3 | 期間の**末尾**を採る間引き | `serving.effects.ts:98` `auditTime(100)` |
| `takeWhile` | 3 | 条件が続く間だけ継続（第2引数 inclusive） | `quality-pipeline.effects.ts:217` |
| `toArray` | 2 | 全通知を配列化 | テスト（`effects.spec.ts`） |
| `bufferTime` | 1 | 一定時間分を束ねる | `layout.effects.ts:79` `bufferTime(500)` |
| `retryWhen` | 1 | **RxJS 7 で deprecated** | `configuration.service.ts:60` |

**`expand` + `reduce` の再帰ページングは辞書に対応する「やりたいこと」行が無い**のが最も痛い欠落です。ClearML の一覧系 Effect の中核パターンで、辞書の逆引き表から「全ページ取得したい」でたどり着けません。

同様に **`timer(0, N)` + `takeWhile` + `takeUntil(ofType(leavePage))` のポーリング停止パターン**も辞書に行がありません。「画面を離れるまで定期取得する」は業務アプリで頻出なので、追加候補として最有力です。

`retryWhen` は RxJS 7 で deprecated（v8 で削除予定）。ClearML 内でも `login.service.ts:90` では新形式の `retry({count: 3, delay: (err, count) => timer(500 * count)})` を使っており、**同一リポジトリ内で新旧が混在**しています。辞書の `retry` 項に「`retryWhen` は非推奨。`retry({delay})` へ」と一文足すと実務で効きます。

### 3-2. 本文で名前は出るが専用項目が無いもの

`timeout` / `finalize` / `delay` / `debounce`（`debounceTime` ではなく時間を Observable で決める方）/ `share` / `EMPTY`。

うち **`debounce`（7 ファイル）** は実挙動が特徴的で、`base-experiment-output.component.ts:128` では

```ts
debounce(auto => auto === false ? interval(0) : interval(5000))
```

と、**値によって待ち時間をゼロと 5 秒で切り替えて**います。`debounceTime` では書けない用途なので、辞書の `debounceTime` 項に対比として 1 行あると良いです。

## 4. NgRx Store：Action 定義・feature 登録・provider 系（まとめて未掲載）

辞書は `Store` / `Action → Reducer` / `Selector` / `Effects` の 4 項で構成されていますが、**Action を「定義する」API と、Store を「アプリに登録する」API が一切ありません**。

| シンボル | ファイル数 | 種別 |
| --- | ---: | --- |
| `createAction` | 44 | Action 定義 |
| `props` | 46 | Action ペイロード型 |
| `createActionGroup` | 7 | Action 一括定義（新しめの書き方） |
| `emptyProps` | 7 | ペイロード無し Action |
| `createFeatureSelector` | 12 | feature state の入口 selector |
| `createFeature` | 5 | reducer + selector 一括定義 |
| `provideState` | 24 | feature 単位の遅延登録 |
| `provideStore` / `provideEffects` / `provideStoreDevtools` | 2 / 26 / 2 | ルート登録 |
| `ActionReducerMap` / `ActionReducer` / `ReducerTypes` / `MemoizedSelector` / `ActionCreator` | 4 / 9 / 9 / 5 / 10 | 型 |
| `MetaReducer` / `USER_PROVIDED_META_REDUCERS` | 1 / 2 | メタリデューサ |
| `select`（pipeable） | 3 | `store.pipe(select(sel))`（旧形式） |
| `provideMockStore` / `MockStore` / `provideMockActions` | 33 / 7 / 2 | **テスト用** |

指摘点:

- **`createFeature` と `createActionGroup`** は NgRx が推奨する新しい書き方で、ClearML 内でも `createAction`（44）と `createActionGroup`（7）が併存しています。辞書の Action 項が `createAction` にも触れていないため、新旧の選択指針を書く場所がありません。
- **`provideState` による feature 遅延登録（24 ファイル）** は「状態の共有範囲・寿命」に直結します。辞書は SignalStore の provider 配置については `signalStore()` 項で丁寧に説明している一方、**Store 側の同じ話（root か feature か、lazy route で登録するか）が欠けており、片側だけ厚い**構成になっています。ここは対称にすべき。
- **`selectSignal` は 303 箇所で使用**されており、辞書の「`[Store]` なら `selectSignal()` を優先」という記述は ClearML の実態と完全に一致します（`store.pipe(select(...))` は 3 箇所のみ）。ここは辞書が正しく実態を捉えている部分。
- **テスト（`provideMockStore` 33 ファイル）に関する記述がゼロ**。辞書のスコープ外と割り切るなら明記、含めるなら 1 節追加。

## 5. SignalStore / Events plugin の未掲載分

辞書は `withReducer` / `withEventHandlers` / Events plugin を「受け手側」から説明していますが、**event を定義・発火する側の API が抜けています**。

| シンボル | ファイル数 | 辞書 | 役割 |
| --- | ---: | --- | --- |
| `eventGroup` | 4 | **無** | event の定義（`source` + `events`） |
| `injectDispatch` | 1 | **無** | コンポーネントから event 発火 |
| `Dispatcher` | 1 | **無** | 同上（inject 形式） |
| `Events` | 3 | 言及のみ | handler 側で `events.on(...)` |
| `signalStoreFeature` | 3 | **無** | 再利用可能な feature の自作 |
| `withDevtools` | 3 | **無** | `@angular-architects/ngrx-toolkit`（NgRx 本体外） |
| `type`（`@ngrx/signals`） | 4 | **無** | event ペイロード型 |

実例（`src/app/webapp-common/core/state/view.events.ts:8`）:

```ts
export const viewEvents = eventGroup({
  source: 'tenant usages',
  events: {
    setServerError: type<{serverError: HttpErrorResponse; /* ... */}>(),
    addMessage: type<{severity: MessageSeverityEnum; msg: string; /* ... */}>(),
  },
});
```

受け手（`view.store.ts:12`）は `signalStoreFeature` + `withEventHandlers` で、**SignalStore の event を受けて従来の NgRx Store へ `dispatch` するブリッジ**を作っています。つまり ClearML は Store と SignalStore を **event 経由で橋渡し**しており、辞書の「4 つは排他的な選択肢ではない」という結語の具体例そのものです。辞書へ実例として組み込む価値が高い箇所です。

`withDevtools` は NgRx 本体ではなく `@angular-architects/ngrx-toolkit` のサードパーティ feature。SignalStore には Store のような devtools 連携が標準で無いため事実上の定番で、辞書に脚注 1 行あると実務者が助かります。

## 6. 参考: Signal ベースのコンポーネント API（辞書のスコープ境界）

状態管理そのものではありませんが、Signal を返す／受け取る API として隣接します。

| シンボル | ファイル数 | 備考 |
| --- | ---: | --- |
| `input` | 194 | 読み取り専用 Signal |
| `output` | 128 | Signal ではないが対 |
| `viewChild` / `viewChildren` | 71 / 7 | Signal クエリ |
| `model` | 9 | **書き込み可能 Signal**（双方向） |
| `contentChild` / `contentChildren` | 2 / 2 | 同上 |
| `untracked` | 12 | 辞書は `effect` 項で 1 度だけ言及 |
| `EffectRef` | 1 | `effect` の手動破棄 |

`model()` は書き込み可能 Signal なので、辞書の「状態」大分類に「親子で双方向に持つ」行を足すかどうかは判断が要ります。**スコープ外とするなら、辞書の冒頭に「コンポーネント I/O は対象外」と明記**するのが親切です。

## 7. 逆方向: 辞書にあるが ClearML では未使用

辞書の網羅性を測る参考として。

- **RxJS**: `zip` / `zipWith` / `mergeWith` / `concatWith` / `scan` / `combineLatestWith`(3 のみ) / `exhaustMap`(2 のみ) / `concatMap`(2 のみ) / `shareReplay`(2 のみ)
- **NgRx SignalStore**: `rxMethod` **0**、`tapResponse` **0**、`withLinkedState` **0**、`withHooks` **0**、`withProps` **0**
- **Angular**: `resource()` **0**、`afterRenderEffect()` **0**、`debounced()` **0**、`linkedSignal` は 12、`rxResource` / `httpResource` は各 1

辞書が手厚く書いている `rxMethod` + `tapResponse` の組は ClearML に 1 箇所もありません。ClearML の非同期は **NgRx Effects に全面的に寄せており**、SignalStore は状態保持と event ブリッジに限定的に使われています。辞書を ClearML 読解用の副教材として使うなら、**`rxMethod` 節より Effects 節を厚くする方が実益がある**、という力学です。

## 8. 辞書への追記提案（優先度順）

| 優先 | 追記内容 | 理由 |
| --- | --- | --- |
| **1** | 「Observable をテンプレートへ出す」行（`async` / `ngrxPush`） | 370 箇所で使われるのに記載ゼロ |
| **2** | 「全ページ取得したい」行（`expand` + `reduce`） | 一覧系 Effect の中核。逆引きで到達不能 |
| **3** | 「画面を離れるまで定期取得」行（`timer` + `takeWhile` + `takeUntil(ofType)`） | 業務頻出。`takeUntilDestroyed` だけでは表現できない |
| **4** | Store 側の provider 配置（`provideStore` / `provideState`） | SignalStore 側だけ厚く、非対称 |
| **5** | Action 定義 API（`createAction` / `props` / `createActionGroup` / `createFeature`） | 「Action → Reducer」項の入口が欠けている |
| **6** | Observable 生成 func の節（`fromEvent` / `interval` / `timer` / `throwError` / `iif` / `from`） | 合流 func だけで源流 func が無い |
| **7** | SignalStore event の発火側（`eventGroup` / `injectDispatch` / `Dispatcher`） | 受け手だけ書かれている |
| 8 | `retry` 項に `retryWhen` 非推奨の注記 | ClearML 内に旧形式が残存 |
| 9 | `debounceTime` 項に `debounce`（動的待機）の対比 | 実コードで使い分けあり |
| 10 | `Subscription` 手動管理の位置づけ | 33 ファイルに残存。移行対象として明示 |
