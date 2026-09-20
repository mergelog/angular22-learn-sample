# ClearML 実験管理画面のコンポーネント分割調査

関連: [00_10_ベストプラクティス.md](../00_10_ベストプラクティス.md) / [26_コンポーネント切り分け.md](26_コンポーネント切り分け.md) / [03_ng-content-使われ方の頻度調査.md](../../x-QA/03_ng-content-使われ方の頻度調査.md)

## 調査の問い

```
親
 ├─ 検索条件
 ├─ テーブル
 ├─ 詳細パネル
 └─ 操作メニュー
```

「その画面でしか使わないコンポーネントでも分割する（1ファイル1コンセプト）」が
ClearML の実験管理画面で実践されているか、どう切られているかを調べる。

## 調査範囲と方法

- 対象リポジトリ: `/Users/yasu/work/mergelog/learn-ClearML-pro`
- 対象画面: 実験管理画面（ルート `projects/:projectId/tasks`、旧 `experiments` はリダイレクト）
  - エントリ: `src/app/webapp-common/experiments/experiment-routes.ts`
  - 親コンポーネント: `@common/experiments/experiments.component`
- 対象ディレクトリ: `src/app/webapp-common/experiments`（39本）と `src/app/features/experiments`（3本）= **コンポーネント42本**
- 数値はテンプレートの静的出現回数と `wc -l` による実測

## 結論（3行）

1. **図の4分割は、そのまま実装されている。** 親テンプレートは162行しかなく、ヘッダ・テーブル・詳細パネル・操作メニューの4つに素直に割れている。
2. **「その画面でしか使わない部品」も分割されている。** 使用箇所が1か所だけの専用コンポーネントが13本ある（ナビバー、説明欄の編集、ソースコード表示など）。
3. **ただし「1ファイル1コンセプト」は親と表で破れている。** 親 TS は866行・44メソッド・`dispatch` 75回。表テンプレートは307行の `@switch` で14カラム分の描画を1ファイルに抱えている。分割が効いているのは view だけで、ロジックは割れていない。

## 採用判断：真似していい箇所 / 真似しない方がいい箇所

新しく画面やコンポーネントを追加するときの判断材料。根拠は本書の各節。

### ◎ 真似していい

| # | やり方 | 理由 | 根拠 |
| ---: | --- | --- | --- |
| 1 | 画面直下をヘッダ / テーブル / 詳細パネル / 操作メニューに割る | 実運用の大規模画面でも成立している。親テンプレートが162行に収まっている | §1 |
| 2 | その画面でしか使わない部品も切り出す | 専用13本が実在し、いずれも肥大していない（最大291行）。汎用化の予定がなくても切ってよい | §4 |
| 3 | 詳細パネルとタブはルート（`loadComponent`）で差し込む | 分割単位＝ディープリンクの単位になる。タブが増えても親テンプレートが伸びない | §3(b) |
| 4 | 操作メニューを「行単位」と「一括（複数選択）」で別部品にする | 対象が単一か複数かで可否判定も表示も違う。図の「操作メニュー」は実務では2つに割れる | §1 |
| 5 | 操作の可否判定を純粋関数に出す | `selectionDisabledArchive()` 等17本。Angular に依存せずテストできる | §6 |
| 6 | メニュー／フッター項目を定義クラスの配列で組む | 項目追加がテンプレート編集ではなく配列への1行追加で済む | §6 |
| 7 | ダイアログはタグに置かず `MatDialog.open` で開く | 6本あるが親テンプレートに1行も現れない | §3(c) |

### × 真似しない方がいい

| # | やり方 | 何が起きるか | 根拠 |
| ---: | --- | --- | --- |
| 1 | 親コンポーネントに全責務を集める | 866行 / 44メソッド / `dispatch` 75回。テンプレートを分割しても TS は痩せない | §5-1 |
| 2 | テーブルのセル描画を `@switch` 1本で書く | 14 case / 307行。カラム追加のたびに同じファイルが伸び、コンフリクト源になる | §5-2 |
| 3 | 子に store を見せず親から全部流す | テーブルへ input 28 + output 16 = 44本。ファイルは分かれても変更の影響範囲は狭まらない | §5-3 |
| 4 | `dumb/` と `containers/` でディレクトリを分ける | `experiments-table` は `dumb/` なのに状態保持、ダイアログは `containers/`。名前が実態を説明しなくなる | §5-4 |
| 5 | 共通実装を継承して差し替える（`base-*` + 薄いサブクラス） | `templateUrl: '../../../../../../src/app/...'` と6階層戻る参照になり、リネームできなくなる | §3(d) §5-5 |
| 6 | Observable と Signal を混在させる | 親 TS は `store.select` 34 / `selectSignal` 4 / `toSignal` 2、テンプレートに `ngrxPush` が39回。読む側が2種類の追い方を強いられる | §5-1 |
| 7 | タイポや未使用コンポーネントを放置する | `experiment-ouptut/` `experiment-info-aritfacts/`、参照ゼロの `experiment-operations-log` | §4 §5-5 |

### ひとことで言うと

> **切り方（どこで分けるか）は真似していい。持ち方（誰が状態を持つか）は真似しない方がいい。**

ClearML の分割は「見た目の単位」と「遷移の単位」については十分よく設計されている。
一方で状態とロジックは親に集約されたままで、分割の恩恵が view 層で止まっている。

### 新規画面を作るときの順番（この調査から導いた手順）

1. **URL を先に決める。** どこまでをディープリンクにするかが、そのまま分割の単位になる（→ ◎3）
2. **親テンプレートを4分割で書く。** 親には「どこに何を置くか」だけ書く（→ ◎1）
3. **状態の取り方を先に統一する。** 子が store を見るのか親が流すのかを決め、Observable / Signal を混ぜない（→ ×3 ×6）
4. **業務ルールの置き場を先に作る。** `xxx.utils.ts` や定義クラス。コンポーネントができてから外へ出すのは難しい（→ ◎5 ◎6 / [26_コンポーネント切り分け.md](26_コンポーネント切り分け.md)）
5. **テーブルのセルは最初からカラム単位で切る。** `@switch` は後から割るのが最も難しい（→ ×2）
6. **専用部品を怖がらず作る。** 1か所からしか使わなくてよい（→ ◎2）

---

## 1. 実際のコンポーネントツリー

`src/app/webapp-common/experiments/experiments.component.html`（162行）の直下がそのまま4分割になっている。

```
ExperimentsComponent (sm-common-experiments)        ← 親
 ├─ sm-overlay                                       ← 共通のバックドロップ
 ├─ sm-experiment-header                             ← 検索条件・カラム設定・表示モード切替
 ├─ as-split
 │   ├─ sm-experiments-table                         ← テーブル
 │   └─ <router-outlet>                              ← 詳細パネル（ルートで差し込む）
 │        └─ sm-experiment-output
 │             ├─ sm-experiment-info-header
 │             ├─ sm-experiment-info-navbar
 │             └─ <router-outlet>                    ← タブ（execution / artifacts / ...）
 ├─ sm-entity-footer                                 ← 複数選択時の一括操作バー
 └─ ng-template #contextMenuExtendedTemplate
      └─ sm-experiment-menu-extended                 ← 右クリック操作メニュー
```

図との対応:

| ベストプラクティスの図 | ClearML の実体 |
| --- | --- |
| 検索条件 | `sm-experiment-header`（中に `sm-common-search` / `sm-custom-cols-menu` / `sm-toggle-archive` / `sm-clear-filters-button` / `sm-refresh-button`） |
| テーブル | `sm-experiments-table`（共通 `sm-table` のラッパ） |
| 詳細パネル | `router-outlet` → `sm-experiment-output` → さらに `router-outlet` でタブ |
| 操作メニュー | `sm-experiment-menu-extended`（行単位）と `sm-entity-footer`（複数選択時）の2系統 |

「操作メニュー」だけが**1つではなく2つに割れている**のが実装上の差分。
行コンテキストメニューと一括操作フッターは、対象が単一か複数かで責務が違うため別部品になっている。

## 2. 各ノードの実体（行数と再利用数）

| ノード | ファイル | TS | HTML | 継承元 | 画面での再利用 |
| --- | --- | ---: | ---: | --- | ---: |
| 親 | `experiments/experiments.component.ts` | 866 | 162 | `BaseEntityPageComponent`(337) | 1 |
| 検索条件 | `dumb/experiment-header/` | 97 | 106 | `BaseEntityHeaderComponent`(22) | 3 |
| テーブル | `dumb/experiments-table/` | 397 | 307 | `BaseTableView`(190) | 5 |
| 詳細パネル | `features/.../experiment-ouptut/` | 39 | 76 | `BaseExperimentOutputComponent`(269) | 3 |
| 操作メニュー | `features/.../experiment-menu-extended/` | 29 | （共通を参照） | `ExperimentMenuComponent`(528/209) | 2 |
| 一括操作 | `shared/entity-page/entity-footer/` | 51 | - | `BaseContextMenuComponent` | 4 |

再利用数は `src/app` 全体でそのタグを書いているファイル数。
`sm-experiments-table` は datasets / pipelines / models / compare からも使われており、
**実験管理画面専用ではなく共通部品として設計されている**。

## 3. 分割の単位は4系統ある

ClearML は「タグで分ける」以外に3つの分割手段を併用している。ここが素直な親子分割との最大の違い。

### (a) タグ（テンプレート）
ヘッダ・テーブル・フッター・コンテキストメニュー。上のツリーの通り。

### (b) ルート（`loadComponent`）
詳細パネルのタブは親テンプレートに一切現れず、`experiment-routes.ts`（273行）で差し込まれる。

```
:experimentId
 ├─ execution      → ExperimentInfoExecutionComponent
 ├─ artifacts      → ExperimentInfoArtifactsComponent
 │    ├─ input-model/:modelId   → ExperimentInfoModelComponent
 │    ├─ output-model/:modelId  → ExperimentInfoModelComponent
 │    └─ artifact/:artifactId/:mode → ExperimentInfoArtifactItemComponent
 ├─ hyper-params   → ExperimentInfoHyperParametersComponent
 │    ├─ configuration/:configObject → ExperimentInfoTaskModelComponent
 │    └─ hyper-param/:hyperParamId   → ExperimentInfoHyperParametersFormContainerComponent
 ├─ general / scalars / plots / debugImages / log
```

タブ選択・選択中の成果物までURLに載っているため、分割単位がそのままディープリンクの単位になっている。

### (c) ダイアログ（`MatDialog.open`）
`create-experiment-dialog` / `clone-dialog` / `move-project-dialog` / `select-queue` /
`abort-all-children-dialog` / `clear-installed-packages-dialog` の6本。
タグとして書かれないので、テンプレートを読むだけではツリーに現れない。

### (d) 継承（`base-*.component.ts`）
`webapp-common/`（共通実装）と `features/`（ビルド差し替え用）の2層構造。
`features/` 側は薄いサブクラスで、テンプレートは共通側を相対パスで指す。

```ts
// features/experiments/containers/experiment-menu-extended/experiment-menu-extended.component.ts（29行）
@Component({
  selector: 'sm-experiment-menu-extended',
  templateUrl: '../../../../../../src/app/webapp-common/experiments/shared/components/experiment-menu/experiment-menu.component.html',
  ...
})
export class ExperimentMenuExtendedComponent extends ExperimentMenuComponent {
  contextMenu = computed(() => this as ExperimentMenuComponent);
}
```

`tsconfig.json` の `~/*` → `src/app/features/*`、`@common/*` → `src/app/webapp-common/*` という
パスマッピングで、OSS版と商用版の差し替えを実現している。
**この継承による分割は「1ファイル1コンセプト」ではなく「1ファイル1バリアント」の分割**で、目的が違う。

## 4. 「画面専用でも分割」の証拠

使用箇所が **1か所だけ** のコンポーネント（＝汎用化の意図がない、その場所専用の部品）。

| コンポーネント | TS | HTML | 使用元 |
| --- | ---: | ---: | --- |
| `experiment-info-header` | 171 | 136 | 詳細パネルのヘッダ |
| `experiment-info-edit-description` | 12 | 8 | 上記ヘッダの説明欄 |
| `experiment-info-navbar` | 24 | 8 | 詳細パネルのタブバー |
| `experiment-details` | 96 | 108 | general タブ |
| `experiment-execution-source-code` | 191 | 125 | execution タブ |
| `experiment-execution-parameters` | 291 | 153 | hyper-params タブ |
| `experiment-log-info` | 236 | 21 | log タブ |
| `experiment-artifacts-navbar` | 40 | 86 | artifacts タブの一覧 |
| `experiment-hyper-params-navbar` | 44 | 58 | hyper-params タブの一覧 |
| `experiment-models-form-view` | 72 | 42 | model 詳細 |
| `experiment-artifact-item-view` | 72 | 47 | artifact 詳細 |
| `select-hyper-params-for-custom-col` | 34 | 11 | ヘッダのカラム追加メニュー |
| `experiment-operations-log` | 102 | 73 | spec 以外から参照なし（デッドコード疑い） |

**13本中12本が実際に使われており、いずれも他画面へ流用されていない。**
「この画面でしか使わないが分割する」は実践されていると言える。

一方で、以下は最初から複数画面での再利用を前提に切られている:

| コンポーネント | 使用箇所数 | 使用先 |
| --- | ---: | --- |
| `sm-experiments-table` | 5 | experiments / datasets / pipelines / models / compare |
| `sm-select-metric-for-custom-col` | 4 | experiments / models / compare / project-info |
| `sm-entity-footer` | 4 | experiments / datasets / pipelines / models |
| `sm-experiment-header` | 3 | experiments / datasets / pipelines |
| `sm-experiment-output` | 3 | datasets / pipelines から（experiments はルート経由） |
| `sm-hyper-param-metric-column` | 3 | experiments / models / serving |

つまり ClearML の切り分けは
**「画面専用の細かい部品」＋「エンティティ横断の共通部品」の二段構え**になっている。

## 5. 破れている箇所（1ファイル1コンセプトから外れている点）

### 5-1. 親コンポーネントが巨大

| 指標 | 値 |
| --- | ---: |
| `experiments.component.ts` 行数 | 866 |
| メソッド数 | 44 |
| `store.dispatch(...)` | 75 |
| `store.select(...)`（Observable） | 34 |
| `store.selectSignal(...)` | 4 |
| `toSignal(...)` | 2 |
| テンプレートでの `ngrxPush` 使用 | 39 |

テンプレートは162行まで小さくできているのに、TS はほぼ全責務を抱えている:

- URL クエリ（`columns` / `order` / `filter` / `archive` / `deep`）と NgRx 状態の双方向同期
- カラム定義の生成（メトリクス列・ハイパーパラメータ列）
- フッター項目（17種）の組み立て
- 選択行・ハイライト行の管理
- CSV ダウンロード、コンテキストメニュー開閉、スプリッタ幅

**「テンプレートを小さくする」は達成、「責務を限定する」は未達**という状態。
ベストプラクティスの2項目は独立に達成しうる、という実例になっている。

### 5-2. テーブルのセル描画が1ファイルに集中

`experiments-table.component.html` は307行で、本体は `@switch (col.id)` の **14 case**。
ID / TYPE / NAME / VERSION / TAGS / USER / PROJECT / STARTED / LAST_UPDATE /
ACTIVE_DURATION / COMMENT / SELECTED / STATUS / PARENT を1テンプレートで描き分けている。
コンポーネントに切り出されているのは `@default` の `sm-hyper-param-metric-column` だけ。

カラム追加のたびにこのファイルが伸びるので、1ファイル1コンセプトの観点では最も崩れている箇所。

### 5-3. 親子の結合が太い（props drilling）

親テンプレートでのバインディング本数:

| 子 | `[input]` | `(output)` | 計 |
| --- | ---: | ---: | ---: |
| `sm-experiments-table` | 28 | 16 | 44 |
| `sm-experiment-header` | 15 | 14 | 29 |

NgRx を使っているにもかかわらず、子は store を直接見ずに親が全部流している。
ファイルは分かれているが、**変更時の影響範囲は狭まっていない**（テーブルに項目を1つ足すと親も触る）。

### 5-4. `dumb/` が dumb ではない

`experiments-table` は `dumb/` 配下だが `BaseTableView` を継承してフィルタ・ソート・選択の状態を保持し、
`create-experiment-dialog` は `containers/` 配下。命名規約と実態が一致していない。

### 5-5. ディレクトリ名のタイポが残存

- `containers/experiment-ouptut/`（output のタイポ）
- `containers/experiment-info-aritfacts/`（artifacts のタイポ）

薄いサブクラスが `templateUrl: '../../../../../../src/app/webapp-common/...'` と
6階層戻る相対パスを書いているため、リネームコストが高く放置されていると見られる。

## 6. 良い点として拾えるもの

### 業務ルールがコンポーネント外に出ている

一括操作の可否判定は `shared/entity-page/items.utils.ts`（201行）に
`selectionDisabledArchive` / `selectionDisabledEnqueue` など **17本の純粋関数**として置かれ、
フッター項目は `footer-items/` の **17クラス**（`ArchiveFooterItem`、`EnqueueFooterItem` …）として定義されている。

```ts
this.footerItems = [
  new ShowItemsFooterSelected(config.entitiesType),
  new CompareFooterItem(config.entitiesType),
  new DividerFooterItem(),
  new ArchiveFooterItem(config.entitiesType),
  ...
];
```

「どの操作がいつ押せるか」というルールがコンポーネントから切り離されており、
`00_10_ベストプラクティス.md` の「業務ルールはコンポーネントの外へ出す」に合致する。

### 分割単位 = URL単位

詳細パネルのタブと、その中で開いている成果物・パラメータまでルートに載っているため、
コンポーネント境界とディープリンク境界が一致している。
分割の理由が「見た目」ではなく「遷移の単位」になっているのが参考になる。

## 7. angular22-sample への示唆

具体的な採否は冒頭の
[採用判断：真似していい箇所 / 真似しない方がいい箇所](#採用判断真似していい箇所--真似しない方がいい箇所)
にまとめた。本書全体から言えるのは次の1点。

> **分割は「view を小さくする作業」ではなく「状態の置き場を決める作業」。**

ClearML は親テンプレートを162行まで削れているのに、親 TS は866行のまま。
テンプレートだけ割っても、URL同期・カラム定義・操作可否・選択状態の行き場が決まっていなければ
すべて親に残る、という実例になっている。
逆にフッター項目（17クラス）と可否判定（17関数）のように
**置き場を先に用意した責務は、最初から親の外に出ている。**

## 付録: 実測コマンド

```bash
# コンポーネント本数
grep -rl "@Component" src/app/webapp-common/experiments src/app/features/experiments --include=*.ts | wc -l

# セレクタごとの使用箇所数
for f in $(grep -rl "@Component" src/app/webapp-common/experiments src/app/features/experiments --include=*.ts); do
  sel=$(grep -m1 -oE "selector: *'[^']+'" "$f" | sed "s/selector: *'//;s/'//")
  echo "$(grep -rl "<$sel" src/app --include=*.html --include=*.ts | wc -l) $sel"
done | sort -n
```

`sm-experiment-info-execution` などタグの使用箇所が0のものは、
ルート（`loadComponent`）またはダイアログ（`MatDialog.open`）から読まれているため
テンプレート検索には現れない。
