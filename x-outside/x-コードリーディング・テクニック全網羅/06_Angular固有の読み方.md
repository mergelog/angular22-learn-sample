# Angular固有の読み方

Angular のコードで読みが止まるのは、たいてい間接のせいである。
テンプレートとクラス、DI と実装、親と子、値と再描画が、それぞれ別の仕組みで結ばれている。
この章は、その結び目ごとに追い方を置く。

前提となる版は Angular 22・NgRx 22・TypeScript 6・PrimeNG 22 である。
`@NgModule` は実質使われておらず（残り 1 ファイル）、standalone コンポーネントで構成されている。

## 1. テンプレートとクラスの往復

コンポーネントは `.ts` と `.html` に分かれている。テンプレートはインライン化しない方針である。

**クラス → テンプレート**: 同じディレクトリの同名 `.html` を開く。

**テンプレート → 使われているクラス**: タグ名でセレクタを検索する。
セレクタは `sm-` 接頭辞でほぼ統一されている（`selector:` 記述 379 件中 345 件）。
例外は、取り込んだ通知ライブラリの `notifier-container` / `notifier-notification` と `al-drawer` である。

```bash
rg -n -t ts "selector: 'sm-experiments-table'" src
```

**クラス → 使用箇所**: タグ名で検索する。

```bash
rg -n -t html "<sm-experiments-table" src
```

standalone なので、テンプレートで使えるコンポーネントは `@Component` の `imports` 配列に
列挙されている。テンプレートに出てくるタグの正体が分からないときは、
まず同じファイルの `imports` を見る。そこに無ければ、そのタグは子コンポーネントではなく
ディレクティブかネイティブ要素である。

## 2. 何が注入されるかを決める

`inject()` が 724 箇所ある。注入されるトークンから実装を特定する手順は三段である。

**第一段: トークンがクラスか。** クラスなら、そのクラス自身が既定の実装である。
`@Injectable({providedIn: 'root'})` が付いていれば、上書きされていない限りそれが動く。

**第二段: providers で差し替えられていないか。** `{provide: X, useClass: Y}` の形を探す。

```bash
rg -n -t ts "provide: .*useClass" src
```

`provide:` の記述は 122 箇所、そのうち `useClass` による差し替えは 4 箇所である。

| 差し替え | 場所 | 及ぶ範囲 |
| --- | --- | --- |
| `RouteReuseStrategy` → `CustomReuseStrategy` | `app.config.ts:77` | アプリ全体 |
| `HTTP_INTERCEPTORS` → `WebappInterceptor` | `app.config.ts:76` | アプリ全体（`multi: true`） |
| `DateAdapter` → `DateFnsAdapter` | `period-selector.component.ts:44` | そのコンポーネントの配下だけ |
| `DateAdapter` → `DateFnsAdapter` | `workloads-page.component.ts:54` | 同上 |

差し替えの階層は三つある。アプリ全体（`app.config.ts`、`core.providers.ts`）、
機能ごと（`*.providers.ts`、20 ファイル）、コンポーネント単位（`@Component` の `providers`）。
**近いほうが勝つ**ので、コンポーネントの `providers` を最初に見る。
上の表の `DateAdapter` が、コンポーネント単位でだけ差し替わる例である。

`useClass` を使わない形もある。providers 配列にクラス名を裸で並べると、
そのクラス自身が注入可能になるだけで、何も差し替えない。
`experiments.providers.ts` の `ExperimentConverterService` と
`CommonExperimentConverterService` はこの形で、両方とも登録されている（§6）。

**第三段: `InjectionToken` なら、値の生成元を探す。** トークン宣言は 10 箇所ある。

```bash
rg -n -t ts "provide: EXPERIMENT_CONFIG_TOKEN" src
```

`useFactory` で作られている場合は、ファクトリ関数の中身が実体である。

## 3. providers ファイルを読む

このリポジトリでは、機能ごとの構成が `*.providers.ts`（20 ファイル）に集約されている。
機能を読み始めるとき、コンポーネントより先にここを読むと構造が一度に入る。

`features/experiments/shared/experiments.providers.ts` には次が並んでいる。

| 記述 | 意味 |
| --- | --- |
| `provideState(EXPERIMENTS_STORE_KEY, experimentsReducers, EXPERIMENT_CONFIG_TOKEN)` | この機能の状態の置き場所と Reducer |
| `provideEffects([...])` | 動く Effect クラスの一覧 |
| `...singleGraphProviders` / `...debugImagesProviders` | 下位機能の取り込み |
| `ExperimentConverterService` / `CommonExperimentConverterService` | 注入可能にするクラス |
| `{provide: EXPERIMENT_CONFIG_TOKEN, useFactory: getExperimentsConfig, deps: [...]}` | meta-reducer の構成 |

`provideEffects` の一覧は、そのまま生死の判定になる。
ここに登録されていない Effect クラスは、ファイルが存在しても動かない
（[04](04_静的探索の道具と手順.md) §5-2）。

## 4. コンテンツ投影とテンプレート参照

テンプレートの実体と表示位置が別ファイルに分かれる仕組みが三つ使われている。

| 仕組み | 件数 | 追い方 |
| --- | --- | --- |
| `<ng-content>` | 66 | 親のテンプレートで、そのタグの中身に何を書いているかを見る |
| `ngTemplateOutlet` | 49 | 差し込まれる `ng-template` を、同ファイル内の `#参照名` で探す |
| `pTemplate`（PrimeNG） | 32 | PrimeNG の表側コンポーネントが、名前で `ng-template` を拾う |
| 動的生成（`createComponent`） | 57 | テンプレートに現れない。呼び出し側のコードで探す |

`pTemplate` は文字列で結ばれているので、定義へのジャンプが効かない。
`pTemplate="body"` のような名前で検索して、受け取り側（`@ContentChild` / `contentChild`）を探す。

テンプレートを親へ渡す（子で定義して親が使う）逆流の形もある。
既存の解析が `docs/sequense/03_テンプレート投影/` に 5 本あるので、
この仕組みで詰まったらそちらを先に読む。

## 5. 値の更新が画面に届く経路

Signal ベースの API と、旧来のデコレータ API と、Observable が混在している。
どれで書かれているかによって、更新の届き方が違う。

| 書き方 | 件数 | 更新の届き方 |
| --- | --- | --- |
| `input()` | 934 | Signal。親が値を変えれば、読んでいるテンプレートだけが再描画される |
| `@Input()` | 153 | 変更検知のサイクルで比較される |
| `output()` | 385 | 子から親へのイベント |
| `model()` | 41 | 双方向。子で書き換えると親にも反映される |
| `signal()` / `computed()` | 125 / 328 | コンポーネント内部の状態 |
| `linkedSignal()` | 26 | 他の Signal から導出しつつ、書き換えもできる |
| `toSignal()` | 76 | Observable を Signal に変換する境界 |
| `effect()` | 150 | Signal の変化に反応して副作用を起こす |
| `viewChild()` / `contentChild()` | 187 / 8 | 子要素の参照 |

読むときの手順は、値を上流へ遡ることである。
テンプレートで `foo()` と呼ばれていたら、クラスで `foo` の宣言を見る。
`computed()` なら中の式をさらに遡り、`input()` なら親のテンプレートへ移る。
`toSignal()` に当たったら、そこから先は Observable の世界になる（[07](07_状態と非同期の読み方.md) §5）。

画面が更新されない理由を追うときは、この鎖のどこで切れているかを見る。
よくある切れ方は、Signal ではない普通のフィールドを書き換えているか、
`toSignal()` の元の Observable が発火していないかのどちらかである。

## 6. 取り込み層と自作層のどちらが動いているか

`webapp-common`（取り込み元、77,967 行）と `features`（自作側、6,510 行）が同居している。
同じ役割のクラスが両方にある場合、どちらが動くかは名前では決まらない。

判定は次の順で行う。

**1. providers の登録を見る。** 登録されている側が動く。
`experiments.providers.ts` では、`ExperimentsInfoEffects`（features）と
`CommonExperimentsInfoEffects`（webapp-common）が**両方**登録されている。片方が他方を置き換えてはいない。

**2. 継承を疑う前にコンストラクタを見る。** `extends Common*` の形は 4 箇所しかなく、
その 4 件はすべて State のインターフェースである。クラスの継承による上書きは 0 件で、
実際には委譲で書かれている。
`features/experiments/shared/services/experiment-converter.service.ts` は
`CommonExperimentConverterService` を継承せず、コンストラクタで受け取って呼び出し、結果に加工を足す。

**3. 空の実装を疑う。** `features` 配下 103 ファイルのうち 25 ファイルが 15 行未満である。
`features/experiments/effects/experiments-info.effects.ts` は 6 行で中身が無い。
`features/experiments/actions/experiments-info.actions.ts` は 0 行である。
これらは上位版のための差し込み口であり、この版では何もしない。

**4. `~/` の指す先を確かめる。** `webapp-common` は `~/business-logic`（566 件）、
`~/shared`（105）、`~/app`（32）、`~/core`（26）を参照する。
`~/features` への参照は 0 件である。取り込み層が自作層を直接呼ぶ経路は無い。

## 7. ルーティング

`app.routes.ts` が入口で、機能ごとに `loadChildren` で分割されている。
ルート定義のファイルは 18 本ある。

```bash
find src -name "*routes*.ts"
```

読むときに見る項目は四つである。

| 項目 | 見どころ |
| --- | --- |
| `path` | URL との対応 |
| `component` / `loadChildren` | 描画されるもの |
| `canActivate` | 入る前に止める処理（`shared/guards/` に 9 本） |
| `data` | 画面の性質を伝える。`{search: true}` `{workspaceNeutral: false}` など |

`data` は型が緩いので、どのキーがどこで読まれるかは検索で追う。

```bash
rg -n -t ts "route.data" src | head
```

`app.config.ts` で `{provide: RouteReuseStrategy, useClass: CustomReuseStrategy}` が登録されている。
この実装は `route.data.reuse` が真のときだけ画面を保持するが、
`data: {reuse: true}` を持つルートはリポジトリ内に一つも無い。
登録されているが働いていない（[12](12_時間を溶かす罠とアンチパターン.md) §2-3）。

## 8. 購読の寿命

`.subscribe(` が 349 箇所ある。購読が切れていないと、画面を離れても処理が走り続ける。
`takeUntilDestroyed` が 168 箇所で使われており、これが付いている購読は
コンポーネントの破棄で切れる。付いていない購読を見たときは、
どこで切っているか（`ngOnDestroy` の中か、`take(1)` などの完了演算子か）を確かめる。

読みの観点では、購読が切れないコードは「この処理はまだ走っているかもしれない」という
可能性を残すので、不具合調査ではここを先に疑う。

## 9. 起動の順序

起動時に何が起きるかは、次の四つを順に読めば決まる。

| 順 | ファイル | 内容 |
| --- | --- | --- |
| 1 | `src/main.ts` | 設定の先読み（`fetchConfigOutSideAngular`）、API ベース URL の確定、bootstrap |
| 2 | `src/app/app.config.ts` | 全体の provider 構成 |
| 3 | `src/app/core/core.providers.ts` | Store と Effects の登録 |
| 4 | `src/app/core/app-init.ts` | 初期化時のユーザ・設定読み込み |

`main.ts` が bootstrap の前に設定を取りに行く点が普通と違う。
`window.configuration` に入れてから Angular を起動するので、
Angular の中から見ると設定は最初から在るように見える。
