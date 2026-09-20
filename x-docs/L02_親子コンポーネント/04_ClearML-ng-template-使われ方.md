# ClearML の `ng-template` の使われ方 QA

関連: [02_ng-content-再投影.md](02_ng-content-再投影.md)、[03_ng-content-使われ方の頻度調査.md](03_ng-content-使われ方の頻度調査.md)

## 調査範囲と集計方法

- 対象: `learn-ClearML-pro/src/app` 配下の `.html` / `.ts`。`_old` と説明用の `.code.md` は除外
- 調査日: 2026-09-17
- 静的出現数: `<ng-template>` **108 件 / 53 HTML ファイル**、`pTemplate` 属性 **31 件**、`ngTemplateOutlet` 関連 **49 件**、`TemplateRef` **54 件**
- `ngTemplateOutlet` は template 本体と `ngTemplateOutletContext` が別々に数えられる。そのため 49 は「描画回数」ではなく属性・構文の出現数
- `*ngIf` 等が Angular 内部で展開する暗黙の template は数えず、明示的な `<ng-template>` のみを対象とした

## Q. ClearML では `ng-template` は主に何のために使うか

**画面の一部分を値（`TemplateRef`）として渡し、共通部品が必要な位置・回数・データで描画するため**に使われています。単に条件分岐の代替ではありません。

最も重要なのは、実験・モデル・Serving などが共用する `sm-table` の列・カード描画です。機能画面は「何を表示するか」を template で渡し、共通テーブルは「何行・何列に置くか」を担当します。

```text
機能画面の <ng-template pTemplate="body" let-col let-row="rowData">
  ↓ コンテンツ投影
sm-table が contentChildren(PrimeTemplate) で収集・名前ごとに仕分け
  ↓
sm-table 内の ngTemplateOutlet が各セル / 各行の context を渡して描画
```

`ng-template` 自体は DOM 要素として表示されません。`pTemplate`、Material の template 用 directive、または `ngTemplateOutlet` が必要なときに embedded view として生成します。

## Q. 最重要の `sm-table` では、どのように使われているか

### 機能画面が名前付き template を差し込む

`experiments-table.component.html` は `sm-table` の子として `pTemplate` を定義します。`pTemplate` は PrimeNG の `PrimeTemplate` directive が template に役割名を付ける仕組みです。全体で 31 件あり、ここが ClearML の最も特徴的な `ng-template` 利用です。

```html
<!-- src/app/webapp-common/experiments/dumb/experiments-table/experiments-table.component.html -->
<sm-table [tableData]="experiments()" [columns]="tableCols()">
  <ng-template let-col pTemplate="sort-filter">
    <sm-table-filter-sort [column]="col"></sm-table-filter-sort>
  </ng-template>

  <ng-template let-col let-experiment="rowData" pTemplate="body">
    @switch (col.id) {
      @case (experimentsTableColFields.NAME) { {{ experiment.name }} }
      @default { <sm-hyper-param-metric-column [col]="col" [experiment]="experiment" /> }
    }
  </ng-template>

  <ng-template let-experiment="rowData" let-selected="selected" pTemplate="card">
    <sm-table-card [rowData]="experiment" [selected]="selected" />
  </ng-template>
</sm-table>
```

役割名は `cardFilter`、`checkbox`、`sort-filter`、`body`、`rowexpansion`、`card` などです。`let-*` は共通テーブルが渡す context をローカル変数へ受ける宣言であり、`let-experiment="rowData"` は `context.rowData` を `experiment` として使う意味です。

### `sm-table` が受け取り、役割名で仕分ける

`table.component.ts` の `contentChildren(PrimeTemplate)` が、呼び出し側から投影された全 template を取得します。`ngAfterContentInit` は `item.getType()`（`pTemplate` の役割名）で `bodyTemplate` 等へ保存します。

```ts
// src/app/webapp-common/shared/ui-components/data/table/table.component.ts
templates = contentChildren(PrimeTemplate);

ngAfterContentInit(): void {
  this.templates().forEach((item) => {
    switch (item.getType()) {
      case 'body': this.bodyTemplate = item.template; break;
      case 'card': this.cardTemplate = item.template; break;
      case 'sort-filter': this.sortFilterTemplate = item.template; break;
      // checkbox / cardFilter / footer / rowexpansion も同様に仕分ける
    }
  });
}
```

`TemplateRef` の型が context 契約にもなっています。たとえば `bodyTemplate` は `{ $implicit: ISmCol; rowData: D; rowIndex: number; expanded: boolean }` を受け取る前提です。

### `sm-table` が行・列ごとに描画する

共通テーブルは各セルで `bodyTemplate` を繰り返し展開します。ここで `$implicit` は列、`rowData` は現在行、`rowIndex` は行番号として渡されます。

```html
<!-- src/app/webapp-common/shared/ui-components/data/table/table.component.html -->
<ng-container
  *ngTemplateOutlet="bodyTemplate;
    context: {$implicit: col, rowData: rowData, rowIndex: index, expanded}">
</ng-container>
```

同じ仕組みで、カード表示では `cardTemplate`、列ヘッダーでは `sortFilterTemplate` / `checkboxTemplate`、空状態では `noDataTemplate`、展開行では `rowExpansionTemplate` を使い分けます。したがって、機能画面側はテーブルの DOM 構造を複製せず、表示差分だけを実装できます。

## Q. `pTemplate` 以外には、どのような受け渡しがあるか

### 親から input で渡す

親が `#ref` で定義した template を子の `input<TemplateRef<...>>()` に渡す形です。実験画面では、追加ボタンと行コンテキストメニューが代表例です。

```html
<!-- experiments.component.html: 親 -->
<sm-experiment-header [addButtonTemplate]="addButton"></sm-experiment-header>
<ng-template #addButton let-isSmallScreen="smallScreen">...</ng-template>

<sm-experiments-table [contextMenuTemplate]="contextMenuExtendedTemplate"></sm-experiments-table>
<ng-template #contextMenuExtendedTemplate let-contextExperiment>...</ng-template>
```

```ts
// experiment-header.component.ts / experiments-table.component.ts: 子
addButtonTemplate = input<TemplateRef<{ smallScreen: boolean }>>();
contextMenuTemplate = input<TemplateRef<{ $implicit: IExperimentInfo }>>(null);
```

子は `ngTemplateOutlet` を使って、ボタンには `{ smallScreen }`、メニューには `{ $implicit: contextExperiment }` を渡して展開します。通常の `ng-content` と違い、親子間を input として明示でき、受け側がデータを供給できます。

### 投影された無名 template を `contentChild` で取る

`sm-simple-table-2` は、子要素として渡された最初の `TemplateRef` を `contentChild(TemplateRef)` で取得します。各行で同じ template を繰り返し描画し、列・行・行番号を context として渡します。

```ts
// simple-table.component.ts
templateRef = contentChild(TemplateRef<{
  $implicit: { class: string; header: string; subHeader?: string };
  row: unknown;
  rowIndex: number;
}>);
```

```html
<!-- simple-table.component.html -->
<ng-template
  [ngTemplateOutlet]="templateRef()"
  [ngTemplateOutletContext]="{$implicit: cols()[i], row: row, rowIndex: i}">
</ng-template>
```

`compare-card-list` も marker directive を指定して `@ContentChild(..., {read: TemplateRef})` で header/body を分ける同系統の設計です。

## Q. 1つの template を複数回・動的に使う例はあるか

あります。代表例は次の3種です。

| 用途 | 実装 | 意図 |
| --- | --- | --- |
| 検索結果の種別切替 | `dashboard-search/search-results-table.component.html` | Project / Task / Model など10種類の named template から、検索結果種別に応じて1つを選び、各 item を `$implicit` で描画 |
| 共通カードの繰返し | `shared/components/virtual-grid`、`nested-project-view-page` | 受け取った `cardTemplate` / `cardContentTemplateRef` を item ごとに展開 |
| 同一UI断片の再利用 | `create-experiment-dialog.component.html` | `#saveButton` を複数ステップの footer へ展開し、ボタンの定義を1か所に保つ |

検索結果の例では、template を値として条件式で選びます。

```html
<ng-container *ngTemplateOutlet="
  activeLinkConfiguration()[i].name === searchPages.projects ? ProjectTemplate :
  activeLinkConfiguration()[i].name === searchPages.experiments ? ExperimentTemplate :
  ModelsTemplate;
  context: {$implicit: item}">
</ng-container>
```

この方式は「データ種別によって component は異なるが、リストを回す処理は共通」というケースに適します。

## Q. Angular Material / CDK が `ng-template` を受ける例はあるか

あります。これらは ClearML 独自の `TemplateRef` input ではなく、ライブラリ directive が template の生成タイミングや配置を管理します。

| directive / outlet | 主な場所 | 役割 |
| --- | --- | --- |
| `mat-tab-label` | `dashboard-search`、`project-settings-dialog` | タブの見出しを通常テキストではなく template として渡す |
| `matExpansionPanelContent` | `project-info`、`debug-images-view` ほか | 展開されるまで内容を遅延生成する |
| `matMenuContent` | `tag-color-menu` | `matMenuTriggerData` の `tag` / `colors` を `let-*` で受け、メニュー項目を生成する |
| `matStepperIcon` | `create-experiment-dialog` | ステッパーの既定アイコンを置換する |
| `[cdkPortalOutlet]` | `project-settings-dialog` | `tab.content` の Portal を動的タブ内に差し込む |
| `ngPluralCase` | `abort-all-children-dialog` | 件数に対応する文言 template を選ぶ |

Material の用途でも「template 自体は非表示で、親コンポーネントまたは directive が必要時に展開する」という原則は同じです。

## Q. `ng-content` ではなく `ng-template` にしている判断基準は何か

ClearML の実例からは、次の条件のいずれかがあると `ng-template` が選ばれています。

| 必要なこと | ClearML の例 | 選ばれる理由 |
| --- | --- | --- |
| 同じ内容を行・カードごとに N 回描く | `sm-table` の `body` / `card` | `ng-content` は同じ投影内容を任意回数複製する用途に向かない |
| 受け側が行データ・画面幅などを渡す | `body` の `rowData`、`addButton` の `smallScreen` | `let-*` と context により、表示側が必要なデータを宣言できる |
| 表示種別を実行時に選ぶ | 検索結果の10種 template | `TemplateRef` を値として保持・選択できる |
| 子やライブラリに描画位置を委ねる | Material tab/menu、CDK Portal | template の生成時期と位置を受け側が制御できる |
| 表示断片を複数箇所で共用する | `saveButton` | 同じ DOM 定義の重複を避けられる |

逆に、呼び出し側の要素をただ1回、決まったスロットへ置くだけなら `ng-content` が使われます。例えば `sm-table-card` の checkbox・アイコン・タグ領域は `ng-content select` で受けています。カード内で「行データを渡して繰り返す部分」は `ng-template`、その行で既に決まった部品を置く部分は `ng-content`、という分担です。

## Q. コードリーディングでは何を追えばよいか

`<ng-template>` を見つけたら、次の順で追うと表示場所とデータ源を特定できます。

1. **識別子**: `#name`、`pTemplate`、Material/CDK directive のいずれかを確認する。
2. **受け手**: `[xxxTemplate]` input、`contentChild` / `contentChildren`、またはライブラリ component を検索する。
3. **展開箇所**: `ngTemplateOutlet`、`cdkPortalOutlet`、または Material directive がある箇所を確認する。
4. **context 契約**: 展開側の `context: {...}` と定義側の `let-*` を対応させる。`$implicit` は名前なしの値、`let-x="key"` は `context.key`。
5. **回数・条件**: `@for`、`@if`、画面モード（table/card）を見て、いつ何回描画されるかを判断する。

実験管理画面を読む最短経路は、`experiments.component.html` の `#contextMenuExtendedTemplate` または `experiments-table.component.html` の `pTemplate="body"` から始め、`sm-table` の `contentChildren(PrimeTemplate)` と `ngTemplateOutlet` までつなぐことです。ここを理解すると、Models・Serving・Workers の同型テーブルも同じ読み方で追えます。

## まとめ

- ClearML の `ng-template` は、**共通UIに表示方法を注入する extension point** として使われる
- 中心パターンは、`pTemplate` → `contentChildren(PrimeTemplate)` → `ngTemplateOutlet` の共通 `sm-table`
- `TemplateRef` input / query と context により、親の表示定義と子の繰返し・状態データの責務を分離している
- Material/CDK の template slot、動的検索結果、ダイアログ内の断片再利用にも同じ原理が適用されている
- 読む際は template の定義だけで終わらせず、**受け取り・展開・context** の3点を必ず対応づける
