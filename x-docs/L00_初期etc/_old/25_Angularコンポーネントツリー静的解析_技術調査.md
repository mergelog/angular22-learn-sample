# Angular コンポーネントツリー静的解析: 既存ツール調査

`ngtree ProjectsPageComponent` のような tree 表示を作るにあたり、既存 npm / OSS の解析結果を流用できるか検証した記録。

調査日: 2026-09-13 / 対象: ClearML Web (`learn-ClearML-pro/apps/web`)

検証対象の規模:

* component: **352**
* TS ファイル: **1491**
* template (`.html`): **335**
* Angular **22.1.5** / TypeScript **6.0**

---

## まず結論

**既存の「Angular 依存グラフツール」は全滅。ただし `@angular/compiler` を直接叩けば約150行で完成する。**

調べた範囲では、Compodoc / angular-toolkit-mcp / ngcompass / ngd / ngrev のいずれも、

> template 上の `<sm-menu-item />` から `MenuItemComponent` への edge

を取得していなかった。全て **TypeScript の import か NgModule の `declarations` を見ているだけ**だった。

一方で、**Angular の公式 template パーサ (`parseTemplate`) がそのまま使える**。ClearML は `@angular/compiler` に既に依存しているので**追加依存ゼロ**。

自作を避けたかったが、正しい答えは

> Angular AST パーサは自作しない（公式のを呼ぶ）
> グラフ構築は自作する（約150行）

だった。

### 重要: Compodoc も不採用

当初は「Compodoc で component 一覧を取り、template 解析だけ自作」を想定していたが、実測したら **Compodoc を使う理由が消えた**。

| | Compodoc 2.0.0 | TS AST 直読み (自作35行) |
| --- | --- | --- |
| components | 352 | **352**（同一） |
| selector 取得 | 350 | **350**（同一） |
| templateUrl 取得 | 336 | **336**（同一） |
| inline template | 6 | **6**（同一） |
| 所要時間 | **4分36秒** | **3.2秒** |
| route 取得 | **47 / 67（34%欠落）** | **110件（全取得）** |
| 出力 | 25MB JSON | メモリ上 |

**結果が同じで、85倍遅く、route を1/3落とす。** 使う意味がない。

---

## 1. ツール別の結論

| ツール | Angular22 | template親子 | 逆引き | route | dynamic | JSON | 採用 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| @compodoc/compodoc 2.0.0 | ○ | **×** | △ | **×** | × | ○ | × |
| @push-based/angular-toolkit-mcp 0.5.0 | △ | **×** | ○(file単位) | × | × | **×** | × |
| ngcompass 0.2.6-beta | ○ | **×** | ○(file単位) | × | × | ○ | × |
| @compodoc/ngd-cli 2.1.0 | × (TS4.0) | × | × | × | × | × | × |
| angular2-dependencies-graph | × (TS2.0) | × | × | × | × | × | × |
| ngrev / ngast | × (Angular11固定) | ○(思想) | 不明 | 不明 | 不明 | × | × |
| **@angular/compiler 直接利用** | ○ | **○** | ○ | ○ | △ | ○ | **◎** |

---

## 2. Compodoc: `relationships` は罠

Compodoc の JSON には `components[].relationships.{incoming, outgoing}` があり、一見これが答えに見える。**が、これは template ではなく `imports:` 配列の写し**。

ソース (`dependencies.engine.ts` の `getRelationships`) を読むと、走査しているのは

```text
imports / exports / declarations / providers / viewProviders
entryComponents / bootstrap / hostDirectives / extends
```

だけで、**template には一切触れていない**。

実害を fixture で確認した。

```ts
@Component({
  selector: 'fx-parent',
  imports: [FxLeaf, FxUnused],   // FxUnused は template で使っていない
  template: `<fx-leaf /><fx-leaf />`,
})
```

| ケース | 正しい答え | Compodoc |
| --- | --- | --- |
| `imports` にあるが template 未使用 | edge なし | **偽陽性を出す** |
| `imports: [...SHARED]` スプレッド経由 | edge あり | **取りこぼす** |
| 同一 template 内で2回使用 | 2本 | 1本 |

実プロジェクトでも `P00Canvas` に対し `MatIconButton` `MatFormField` `MatInput` `MatLabel` `MatSuffix` `MatIconModule` の**偽陽性6件**を出した。

### DOM Tree タブについて

Compodoc には `--disableDomTree` フラグと「DOM Tree」タブがあるが、**component tree は取り出せない**。

1. サーバ側 `components-tree.engine.ts` に cheerio で selector 照合する実装はあるが、**`createTreesForComponents()` はどこからも呼ばれていない死んだコード**（`addComponent()` だけが呼ばれている）
2. HTML の DOM Tree タブは**ブラウザ上で**そのコンポーネント自身の template だけを解析する。**再帰しないし JSON にも出ない**

---

## 3. angular-toolkit-mcp: `build-component-usage-graph` の正体

MCP サーバを実際に起動して呼び出した（`--workspaceRoot` と `--ds.*` 4つが必須。`deprecatedCssClassesPath` は JSON 不可で default export を持つモジュールが要る）。

内部実装（`main.js` webpack module 581/582/583）:

* `.ts/.tsx/.js/.jsx` → `ts.createSourceFile` で **ES6 import / require / dynamic import** を抽出
* `.css/.scss` → `@import` と `url()` の正規表現
* **`.html` → 分岐が存在せず `dependencies = []`。template は一切解析されない**

**純粋な TypeScript import graph。**

実行結果:

```text
Component: P00NoviceCard
- typescript: novice/cards/p00-novice-card.ts
- typescript: novice/cards/p00-novice-add-card.ts
- typescript: novice/cards/p00-novice-name-card.ts
```

利用元2件は当たっているが、

* **クラス名でなくファイルパス**
* 出力が整形テキストで **JSON でない**
* `violationFiles` 必須（デザインシステム違反リファクタ専用の導線）
* 行番号・edge 種別なし

fixture では `fx-shared.ts`（component ですらない定数ファイル）を利用元として返し、真の利用元 `fx-spread-parent.ts` を落とした。

なお同パッケージには `visitComponentTemplate` / `tmplAstElementToSource` という**本物の Angular template AST ビジター**が入っている。ただし用途は **CSS クラスの非推奨検出**で、usage graph では使われていない。

---

## 4. 「過去にどう解いていたか」

| ツール | 方式 |
| --- | --- |
| @compodoc/ngd | NgModule の `declarations` / `imports` / `exports` / `providers` / `bootstrap` を graphviz 化 |
| angular2-dependencies-graph | 同上。`templateUrl` は**文字列メタとして保持するだけ**でパースしない |
| ngrev / ngast | **Angular コンパイラをラップ**する方式（思想としては正しい）。ただし `ngast` は `@angular/compiler@11.0.9` 固定で 2022年で更新停止 |
| ngcompass | ファイル単位の TS import graph（`--depth` の単位が "import hops"）。`@angular/compiler` 非依存 |

**歴史的な正解は ngrev / ngast の「Angular コンパイラを使う」路線**だった。今それをやるなら `@angular/compiler` を直接呼べばよい。

---

## 5. 実測: 公式パーサ方式の精度

`@angular/compiler` の `parseTemplate` + `tmplAstVisitAll` で全 template を解析し、**独立実装（正規表現 grep）と全件突合**した。

```text
自作PoC (Angular公式パーサ) : 571 edges
grep方式の正解              : 574 edges
```

差分3件を調べたら、**すべて `<!-- HTMLコメント -->` の中**だった。

```text
QueuesComponent -> RefreshButtonComponent   (queues.component.html:10)
ServingTableComponent -> TagListComponent   (serving-table.component.html:79)
ServingTableComponent -> IdBadgeComponent   (serving-table.component.html:82)
```

grep 側が偽陽性を出し、**Angular パーサが正しくコメントを除外した**。

```text
補正後の正解 571 == PoC 571   → 偽陽性 0 / 偽陰性 0
```

### 出力例

```text
ProjectsPageComponent
├── ProjectsListComponent
│   ├── ProjectCardComponent (参照元: 2)
│   │   ├── CardComponent (参照元: 8)
│   │   ├── ProjectCardMenuExtendedComponent
│   │   │   ├── MenuComponent (参照元: 17)
│   │   │   ├── MenuItemComponent (参照元: 31)
│   │   │   ├── MenuItemComponent (参照元: 31)
│   │   │   ├── MenuItemComponent (参照元: 31)
│   │   │   └── MenuItemComponent (参照元: 31)
│   │   ├── CircleCounterComponent (参照元: 19)
│   │   ├── CircleCounterComponent (参照元: 19)
│   │   └── CircleCounterComponent (参照元: 19)
│   └── DotsLoadMoreComponent (参照元: 13)
└── ProjectsHeaderComponent (参照元: 4)
    ├── MenuComponent (参照元: 17)
    ├── MenuItemComponent (参照元: 31)
    ├── MenuItemComponent (参照元: 31)
    ├── ShowOnlyUserWorkComponent (参照元: 2)
    │   └── ShowOnlyUserWorkMenuComponent
    ...
```

逆引き（`--parents`）も file:line 付きで出る。

```text
MenuItemComponent  ← 参照元 31 件
  CustomColumnsListComponent  (.../custom-columns-list.component.html:3)
  ExperimentHeaderComponent   (.../experiment-header.component.html:38)
  ExperimentHeaderComponent   (.../experiment-header.component.html:39)
  ProjectCardMenuComponent    (.../project-card-menu.component.html:2)
  ...
```

### grep より優れていた点

`ProjectCardMenuExtendedComponent`（`features/`）は

```ts
templateUrl: '../../../../webapp-common/shared/ui-components/panel/project-card-menu/project-card-menu.component.html'
```

と、**`webapp-common` の template を共有**している。1つの template が2クラスに帰属する ClearML の `features/` 上書きパターン。

PoC は両方に正しく edge を張るが、grep は1回しか数えない。

---

## 6. 実スケールで判明したこと

### 消えた懸念

小規模サンプルの時点では「複合 selector が怖い」と思っていたが、実データでは杞憂だった。

| 懸念 | 実測 |
| --- | --- |
| 複合 selector `a, b` | **0件** |
| 属性 selector の component | **0件**（属性 selector 31件は全て `@Directive`） |
| `:not()` | **0件** |
| component selector | **348/352 が単純要素名**（`sm-` prefix が345件） |

**selector 照合は要素名の完全一致だけで足りる。**

### 新たに見つかった穴

小規模サンプルでは絶対に見えなかったもの。

**(1) クラス名の重複**

```text
AppComponent
  - src/app/app.component.ts
  - src/app/webapp-common/clearml-applications/report-widgets/src/app/app.component.ts
```

ノードをクラス名でキーすると**1件消える**（実際 352 → 351 になった）。→ `file#className` でキーすること。

**(2) selector の重複**

```text
sm-image-viewer -> BaseImageViewerComponent, ImageViewerComponent
```

基底クラスと具象クラスが同一 selector を持つ。→ 解決規則が必要。

**(3) service / NgRx effects からの `dialog.open()`**

component ファイルだけ走査すると **14件 / 11ファイル取りこぼす**。

```text
src/app/webapp-common/core/effects/projects.effects.ts
src/app/webapp-common/core/effects/layout.effects.ts
src/app/webapp-common/experiments/effects/common-experiments-menu.effects.ts
...
```

→ 全 `.ts` を走査すれば解決（実装済み、85件検出）。

---

## 7. 動的 component

ClearML での実使用数を数えた。

| パターン | 件数 | 取得可否 |
| --- | --- | --- |
| `MatDialog.open()` | **85** | ○ TS AST で取得（実装済み） |
| `loadComponent` (route) | **110** | ○ TS AST で取得（実装済み） |
| `NgComponentOutlet` | 2〜3 | △ クラス参照束縛なら可 |
| `ViewContainerRef.createComponent` | 少数 | ○ |
| `ComponentPortal` / `TemplatePortal` | **0** | 対応不要 |

`MatDialog` は 85件あり、**template 解析では絶対に出ない実在の関係**。無視できない。

```text
DebugImagesComponent      -> ImageViewerComponent    [dialog] (debug-images.component.ts:299)
BaseEntityPageComponent   -> ConfirmDialogComponent  [dialog] (base-entity-page.ts:277)
ExperimentCompareHeader.. -> SelectModelComponent    [dialog] (...:142)
```

原理的に取れないのは `COMPONENT_MAP[key]` のような実行時解決のみ。

---

## 8. 最小実装案

### 既存ツールから取得する部分

| 取得物 | 供給元 |
| --- | --- |
| **template AST**（`@if` / `@for` / `@defer` / コメント除外 / self-closing 全部込み） | **`@angular/compiler` の `parseTemplate`** |
| TS AST | `typescript` |

どちらも ClearML が既に依存済み。**追加 npm 依存はゼロ。**

### 自作する部分（約150行）

| 実装 | 規模 |
| --- | --- |
| component メタデータ抽出（name / selector / file / templateUrl） | 約35行 |
| template → edge（file:line 付き） | 約30行 |
| route edge（`loadComponent` / `component:`） | 約20行 |
| dynamic edge（`dialog.open` / `createComponent`） | 約20行 |
| 逆引き index + tree 整形 | 約45行 |

### 統合パイプライン実測

```text
components      : 351   ※クラス名キーのバグで1件消失（要修正）
template edges  : 697
route edges     : 110   ← Compodoc の 77 を上回る
dynamic edges   :  85
所要時間        : 7.3秒
```

### 実装時に必ず入れること

実スケールで実証された要件。

1. ノードキーは **`file#className`**（`AppComponent` 重複対策）
2. **selector 重複時の解決規則**（`sm-image-viewer` 対策）
3. dynamic 走査は component ファイルではなく**全 `.ts`**（effects 対策）
4. **同一 templateUrl を複数クラスが共有するケースを保持**（`features/` 上書き対策）

---

## 9. 未決事項

表示仕様。現状は出現回数をそのまま出すため、`MenuItemComponent` が兄弟に4つ並ぶ。

```text
├── MenuItemComponent (参照元: 31)
├── MenuItemComponent (参照元: 31)
├── MenuItemComponent (参照元: 31)
└── MenuItemComponent (参照元: 31)
```

`(×4)` に畳むか、出現ごとに行を出すか。どちらも数行の差なので、実際に使ってから決める。

---

## 参考: 検証手順の再現

```bash
# Compodoc (参考。採用しないが比較用)
npx @compodoc/compodoc src -p tsconfig.json -e json -d out

# angular-toolkit-mcp (MCP stdio。--ds.* 4つが必須)
node main.js --workspaceRoot <root> \
  --ds.storybookDocsRoot docs --ds.deprecatedCssClassesPath deprecated.mjs \
  --ds.uiRoot src --ds.generatedStylesRoot src

# ngcompass
npx ngcompass graph --stdout
```

`parseTemplate` の最小形:

```ts
import { parseTemplate, TmplAstRecursiveVisitor, tmplAstVisitAll } from '@angular/compiler';

class Collector extends TmplAstRecursiveVisitor {
  constructor(private out: any[]) { super(); }
  visitElement(el) {
    this.out.push({ tag: el.name, line: el.startSourceSpan.start.line + 1 });
    super.visitElement(el);   // これを忘れると子を辿らない
  }
  visitComponent(node) {      // selectorless <Foo /> (Angular 20+)
    this.out.push({ tag: node.componentName, line: node.startSourceSpan.start.line + 1 });
    super.visitComponent(node);
  }
}

const parsed = parseTemplate(html, filePath, { preserveWhitespaces: true });
const found: any[] = [];
tmplAstVisitAll(new Collector(found), parsed.nodes);
```

`selector → component` の Map を作って `found` の `tag` を引けば edge になる。
