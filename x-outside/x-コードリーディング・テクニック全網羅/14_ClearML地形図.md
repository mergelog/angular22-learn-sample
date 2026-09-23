# ClearML地形図

このリポジトリの実測値と構造。
パスを見た瞬間に役割が決まる状態を作るための表である。
計測は 2026-09-23 時点。数字は [02_全体地図](02_全体地図の作り方.md) §3 のコマンドで取り直せる。

## 1. 何であるか

ClearML Web（`https://github.com/clearml/clearml-web`、tag `v2.5` / `48b61702f703`）を
fork した Angular アプリに、学習・推論・観測の Python 実装と、自作の 2 機能を足したもの。

| 項目 | 版 |
| --- | --- |
| Angular | 22.1.5 |
| NgRx | 22.0.0 |
| TypeScript | 6.0 |
| RxJS | 7.8.2 |
| PrimeNG | 22.1.0 / Angular Material 22.1.5 |
| Vitest | 4.1.11 / Playwright 1.62.1 |

`@NgModule` は実質使われていない（残り 1 ファイル）。standalone 構成である。

## 2. 層の地図

```
src/app/
├── main.ts / app.config.ts / app.routes.ts   起動と全体構成
├── core/           17 files    530 lines   Store 登録、初期化、interceptor
├── layout/          3 files     80 lines   ヘッダ・サイドナビ・パンくず
├── shared/         11 files    305 lines   guards / resolvers / 自作の共有
├── features/      103 files  6,510 lines   自作機能 + 差し込み口
├── webapp-common/ 783 files 77,967 lines   取り込み元の本体（凍結領域）
├── business-logic/607 files 27,139 lines   生成された API 型とクライアント
└── build-specifics/ 3 files     22 lines   ビルド構成で差し替わる
```

合計 1,569 ファイル / 118,517 行（TypeScript）。テンプレート 335 / 18,472 行、SCSS 376 ファイル。

比率だけ覚えれば足りる。**取り込み 66%、生成 23%、自作 5.5%** である。
読む価値がある密度は、この逆順になる。

## 3. パスから役割を決める

| パスの先頭 | 由来 | 読み方 |
| --- | --- | --- |
| `src/app/features/data-catalog/` | 自作 | 設計意図がある。構造も現代的。丁寧に読む |
| `src/app/features/quality-pipeline/` | 自作 | 同上 |
| `src/app/features/` （その他） | 差し込み口 | 25 ファイルが 15 行未満。中身が無いことを先に疑う |
| `src/app/core/` `shared/` `layout/` | 自作側 | `webapp-common` から `~/` で参照される差し替え層 |
| `src/app/webapp-common/` | 取り込み | 設計意図を探さない。外形だけ取る |
| `src/app/business-logic/model/` | 生成 | 読まない。型の形だけ見る |
| `src/app/business-logic/api-services/` | 生成 | メソッド名と引数型だけ取る |

### 3-1. 自作機能の構造

`data-catalog`（20 files / 2,846 lines）と `quality-pipeline`（15 files / 1,545 lines）は、
取り込み層と違う構造で書かれている。

```
features/data-catalog/
├── data-access/     API サービス（生成型に触れてよい境界）
├── state/           actions / reducer / effects / selectors
├── containers/      画面
└── components/      部品
```

テストは `src/tests/features/{機能名}/` に同じ構造で置かれている。
この 2 機能はテストが実装を説明するので、[03](03_探索戦略と読む順序.md) §3-4 のテスト法で読める。

### 3-2. 取り込み層の内訳

| ディレクトリ | ファイル | 行 |
| --- | --- | --- |
| `webapp-common/shared/` | 352 | 23,581 |
| `webapp-common/experiments/` | 79 | 13,005 |
| `webapp-common/experiments-compare/` | 54 | 7,586 |
| `webapp-common/models/` | 36 | 5,558 |
| `webapp-common/core/` | 33 | 3,238 |
| `webapp-common/dashboard-search/` | 23 | 2,254 |
| `webapp-common/workers-and-queues/` | 21 | 1,833 |

## 4. パスエイリアス

`tsconfig.json` の `paths` による。

| 書き方 | 実体 | 使用数 |
| --- | --- | --- |
| `@common/*` | `src/app/webapp-common/*` | 2,520 |
| `~/*` | `src/app/*` | 895 |
| `@features/*` | `src/app/features/*` | 364 |
| `@environments/*` | `src/environments/*` | 1 |

`~/` は「差し替え可能な層」を指すための書き方である。
`webapp-common` からの `~/` 参照の内訳は
`business-logic` 566 / `shared` 105 / `app` 32 / `core` 26 / `layout` 1 / `build-specifics` 1。
`~/features` への参照は 0 件である。取り込み層は自作機能を知らない。

## 5. 用語の対応表

画面の言葉と、コード・API の言葉が違う。
検索語を決める前にここを引く。対応は `src/app/shared/constants/non-common-consts.ts` の
`EntityTypeEnum` に定義されている。

| 画面の言葉 | コード・API での語 | 検索するならこちら |
| --- | --- | --- |
| Experiment | `task` | `tasks.service.ts`、`tasks.get_all_ex`、`EntityTypeEnum.experiment` |
| Dataset（バージョン） | `version` | `dataset-version/`、`:versionId` |
| Dataset（そのもの） | `dataset` | `datasets/`、`openDataset` |
| Pipeline run | `pipeline run` / `controller` | `pipelines-controller/` |
| Model | `model` | `models.service.ts` |
| Project | `project` | `projects.service.ts` |
| Report | `report` | `reports.service.ts` |
| Endpoint（Serving） | `endpoint` | `serving.service.ts` |
| Queue / Worker | `queue` / `worker` | `queues.service.ts` / `workers.service.ts` |

`business-logic/api-services/` に `experiments.service.ts` は存在しない。
`webapp-common/experiments/` の Effects はすべて `ApiTasksService` を注入している。
URL にも痕跡が残っており、`features/datasets/datasets.routes.ts` に
`{path: 'experiments', redirectTo: 'tasks'}` がある。

### 5-1. 紛らわしい語

| 語 | このコードベースでの意味 | 誤読しやすい意味 |
| --- | --- | --- |
| `events` | スカラー指標・プロット・ログ・デバッグ画像（`events.service.ts`、1,181 行） | UI のイベント |
| `business-logic` | 生成された API 型とクライアント | 業務ロジック |
| `webapp-common` | 取り込み元の本体 | 共通部品 |
| `dumb` | 表示専用コンポーネントを置くディレクトリ名 | — |
| `containers` | 状態に接続するコンポーネント | — |
| `Common*` クラス | 取り込み層の実装 | 共通基底クラス（継承はされていない） |

`events.*` の API は 20 を超える。
`events.get_scalar_metric_data`、`events.get_task_log`、`events.debug_images` などで、
どれも実験の出力データを指す。

```bash
rg -o '\$\{this\.basePath\}/events\.[a-z_]+' src/app/business-logic/api-services/events.service.ts --no-filename | sort -u
```

## 6. 入口

| 知りたいこと | ファイル |
| --- | --- |
| 起動の順序 | `src/main.ts` → `src/app/app.config.ts` → `src/app/core/core.providers.ts` → `src/app/core/app-init.ts` |
| URL と画面の対応 | `src/app/app.routes.ts` と、`loadChildren` 先の 18 本の `*routes*.ts` |
| Store の第一階層 | `src/app/core/core.config.ts` の `reducers` |
| 機能ごとの構成 | `*.providers.ts`（20 ファイル） |
| API | `src/app/business-logic/api-services/`（17 ファイル、201 エンドポイント） |
| 共通の HTTP 処理 | `src/app/webapp-common/core/interceptors/webapp-interceptor.ts` |
| ビルドの差し替え | `angular.json` の `fileReplacements` |
| 依存の禁止規則 | `web-boundaries.json` |
| 上流の追跡 | `upstream.json` |

## 7. 既存の調査資料

調査の前にここを検索する（[13](13_目的別レシピ集.md) R13）。

| 系統 | 場所 | 内容 |
| --- | --- | --- |
| 一本線追跡 | `ngbi-*.md`（3本） | 行クリック、ヘッダ表示、実験名の変更 |
| シーケンス図（体系） | `docs/sequense/`（44本） | コンポーネント連携 6・状態保持 6・テンプレート投影 5・バックエンド経路 5・部品別経路 22 |
| シーケンス図（操作） | `x-sequense/01_実験名の変更と一覧反映/`（7本） | 一つの操作を観点別に |
| 実装技術の調査 | `x-QA/`（4本） | テーブル、絞り込み、IME、画面間の接続 |
| 親子関係の技術 | `x-analyze-docs/`（4本） | コンポーネント親子関係の実現技術 |
| コンポーネントツリー | `ng-maze-*.md` | `ExperimentsComponent`（53KB）ほか |
| 参照元の逆引き | `madge-rdeps-*.md` | `InlineEditComponent` |
| 公式との比較 | `x-ClearML_公式とカスタマイズ済み比較.md`（29KB） | fork 元との差 |
| 設計資料 | `docs/phase1〜8/` | 要件から運用まで。読み順は `docs/README.md` §2 |
| 不具合調査 | `x-不具合調査/` | 調査プランと記録 |
| UX 提案 | `x-新規提案/`（21本） | 画面の改善案 |

`_old` が付くディレクトリは、指示がない限り見ない。

## 8. 規模の指標

読む前に量を見積もるための数字。

| 項目 | 数 |
| --- | --- |
| `@Component` / `@Directive` | 352 / 40 |
| `selector:` 記述（うち `sm-` 接頭辞 / 属性形式） | 379（345 / 29） |
| `@Injectable` | 102 |
| `createAction` | 666（うちテンプレートリテラル 23） |
| `createSelector` | 517 |
| `store.dispatch(` | 1,026 |
| `store.select(` | 928 |
| `ofType(` | 293 |
| Action / Reducer / Effects ファイル | 48 / 41 / 46 |
| `inject()` | 724 |
| `input()` / `output()` / `model()` | 934 / 385 / 41 |
| `@Input()` | 153 |
| `signal()` / `computed()` / `linkedSignal()` / `effect()` | 125 / 328 / 26 / 150 |
| `toSignal()` | 76 |
| `viewChild()` / `contentChild()` | 187 / 8 |
| `.pipe(` / `.subscribe(` | 1,060 / 349 |
| `switchMap` / `mergeMap` / `concatMap` / `exhaustMap` | 340 / 252 / 5 / 8 |
| `takeUntilDestroyed` | 168 |
| `catchError` | 245 |
| `createComponent` / `ngTemplateOutlet` / `ng-content` / `pTemplate` | 57 / 49 / 66 / 32 |
| `InjectionToken` 宣言 / `provide:` 記述 | 10 / 122 |
| `: any` / `as any` / `@ts-ignore` | 683 / 55 / 1 |
| 循環依存 | 35 |
| spec ファイル | 78（E2E 6 本は別） |
| Python | 165 ファイル / 28,655 行 |

## 9. 大きいファイル

| 行 | ファイル | 種別 |
| --- | --- | --- |
| 2,331 | `business-logic/api-services/tasks.service.ts` | 生成。読まない |
| 1,516 | `webapp-common/pipelines-controller/pipeline-controller-info/pipeline-dummydata.ts` | データ。読まない |
| 1,279 | `webapp-common/shared/single-graph/single-graph.component.ts` | 手書き |
| 1,181 | `business-logic/api-services/events.service.ts` | 生成 |
| 1,094 | `business-logic/api-services/models.service.ts` | 生成 |
| 1,078 | `webapp-common/experiments/effects/common-experiments-view.effects.ts` | 手書き。一覧の中心 |
| 1,053 | `business-logic/api-services/projects.service.ts` | 生成 |
| 866 | `webapp-common/experiments/experiments.component.ts` | 手書き。画面の中心 |
| 716 | `webapp-common/experiments/effects/common-experiments-info.effects.ts` | 手書き |
| 658 | `webapp-common/tasks/tasks.utils.ts` | 手書き |
| 627 | `webapp-common/shared/ui-components/data/table/table.component.ts` | 手書き。全画面の表 |
| 580 | `features/data-catalog/data-access/data-catalog-api.service.ts` | 自作 |

読む順で言えば、`experiments.component.ts` →
`common-experiments-view.effects.ts` → `table.component.ts` の三本が、
このアプリの中心を押さえる最短経路である。

## 10. 環境

| 項目 | 値 |
| --- | --- |
| 開発サーバ | `ng serve --host 0.0.0.0 --port 4200`（`angular.json` の既定は 4300） |
| API プロキシ | `/service/1/api` → `http://localhost:8008`（`proxy.config.mjs`） |
| 開発ビルド | `optimization: false`、`sourceMap: true` |
| Redux DevTools | 開発のみ。`maxAge: 100`、`trace: true`、`traceLimit: 50` |
| バックエンド | Docker。`pnpm run backend:up` / `backend:status` / `backend:down` |
| ポート共有 | `../001-learn-ClearML` と 8008/8080/8081 を共有。同時起動不可 |
| 使える CLI | `rg` `madge` `tree` `git` `node` `pnpm` |
| 無い CLI | `ast-grep` `jq` `fd` `fzf` `ctags` `semgrep`（`sg` は `setgroups`。別物） |

## 11. 履歴の制約

コミットは 23 個。fork 元のコードは `86e6dbd first commit` にまとめて入っており、
それ以前の履歴が無い。取り込み層に `git blame` は効かない。

`upstream` リモートは登録済みだが未取得である。使う前に取得が要る。

```bash
git fetch upstream --filter=blob:none --tags
```

詳細は [09_履歴と差分](09_履歴とフォーク差分から読む.md)。
