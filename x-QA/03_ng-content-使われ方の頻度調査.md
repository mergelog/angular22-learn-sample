# ng-content の使われ方 頻度調査（learn-ClearML-pro / 実験管理画面）

関連: [02_ng-content-再投影.md](02_ng-content-再投影.md)

## 調査範囲と方法

- 対象: `src/app/features/experiments` と `src/app/webapp-common/experiments`（html 39 本）
- 「定義側」= `ng-content` を書いているコンポーネント。画面から呼ばれている共有 UI（`sm-*`）まで 1 階層たどって集計
- 「使用側」= 実験管理画面のテンプレートで、コンポーネントタグの内側に中身を書いている配置
- 数値は静的なテンプレート出現回数。`@for` で繰り返し描画される箇所も 1 件として数える

## 1. 定義側：セレクタ種別の頻度

実験管理画面が使う `sm-*` タグは 57 種。うち `ng-content` を持つのは **14 種 / 宣言 25 件**。

| セレクタ種別 | 件数 | 割合 | 例 |
| --- | ---: | ---: | --- |
| 属性 `select="[attr]"` | 11 | 44% | `[extra-buttons]` `[search-button]` `[refresh]` `[fixedOptions]` |
| デフォルト（`select` 無し） | 9 | 36% | `sm-labeled-row` の値部分 |
| 要素 `select="tag"` | 3 | 12% | `mat-checkbox` `sm-status-icon-label` |
| クラス `select=".class"` | 2 | 8% | `.linkToOrigin` `.uptime` |

**属性セレクタが最頻**。クラス・要素セレクタは少数派で、どちらもカード/ヘッダ系の見た目部品に限られます。

## 2. 定義側：コンポーネント別のスロット数と使用回数

| コンポーネント | スロット数 | 画面での使用回数 |
| --- | ---: | ---: |
| `sm-labeled-row` | 1 | 36 |
| `sm-editable-section` | 3 | 15 |
| `sm-dialog-template` | 1 | 6 |
| `sm-scroll-textarea` | 2 | 6 |
| `sm-paginated-entity-selector` | 1 | 3 |
| `sm-menu` | 2 | 2 |
| `sm-search` | 2 | 2 |
| `sm-experiment-menu-extended` | 1 | 2 |
| `sm-table-card` | 7 | 1 |
| `sm-experiment-info-header` | 1 | 1 |
| `sm-experiment-info-navbar` | 1 | 1 |
| `sm-grouped-checked-filter-list` | 1 | 1 |
| `sm-inline-edit` | 1 | 1 |
| `sm-experiment-details` | 1 | 1 |

スロット数の分布は **1 スロットが 9 / 14**。多スロットは `sm-table-card`（7）と `sm-editable-section`（3）だけで、どちらも「枠だけ用意して中身は呼び出し側」という汎用パーツです。

## 3. 使用側：コンテンツを渡している配置の内訳

実験管理画面のテンプレートで、タグの内側に中身を書いている配置は **263 件**（コンポーネント配置総数 418 件中）。

| 渡し先 | 件数 |
| --- | ---: |
| Angular Material / CDK / 外部（`mat-*`, `cdk-*`, `as-split*`） | 188 |
| 自社コンポーネント（`sm-*`） | 75 |

渡し先の上位は次の通り。

| 渡し先タグ | 件数 |
| --- | ---: |
| `mat-form-field` | 44 |
| `sm-labeled-row` | 36 |
| `mat-label` | 31 |
| `mat-error` | 21 |
| `sm-editable-section` | 15 |
| `mat-radio-button` | 12 |
| `mat-expansion-panel` / `mat-expansion-panel-header` / `mat-option` | 各 9 |
| `mat-checkbox` | 8 |
| `as-split-area` / `mat-select` / `sm-dialog-template` | 各 6 |

**コンテンツ投影の大半は Angular Material を使うため**に発生しており、自社の `ng-content` 設計に由来する分はそのうち 75 件です。

## 4. 使用側：デフォルトスロットか名前付きスロットか

`ng-content` を定義した `sm-*` への配置 69 件の内訳。

| 渡し方 | 件数 | 割合 |
| --- | ---: | ---: |
| デフォルトスロットのみ | 58 | 84% |
| 名前付きスロット（マーカー属性/クラス付き） | 11 | 16% |

名前付きスロットを実際に使っている箇所は 4 コンポーネントに限られます。

| 渡し先 | 使っているスロット | 呼び出し元の例 |
| --- | --- | --- |
| `sm-editable-section` | `[extra-buttons]` `[search-button]` | `experiment-info-execution` ほか |
| `sm-scroll-textarea` | `[extra-buttons]` | `experiment-info-task-model` ほか |
| `sm-experiment-info-navbar` | `[refresh]` | `experiment-output` |
| `sm-table-card` | 6 スロット同時 | `experiments-table` |

つまり `ng-content` の 44% は属性セレクタで定義されているのに、**実際に名前付きスロットへ渡している呼び出しは 16% しかない**。多くは将来の差し込み口として空のままです。

## 5. パターン別の出現頻度

| パターン | 件数（宣言 25 件中） | 備考 |
| --- | ---: | --- |
| 単純な 1 スロット（ラベル + 値など） | 9 コンポーネント | `sm-labeled-row` が代表 |
| `@if` / `@else` の中に置く条件付きスロット | 5 | `editable-section:17`, `scroll-textarea:5`, `search:30`, `table-card:10,15` |
| 再投影（別コンポーネントタグの内側） | 3 | すべて `<mat-menu>` の中 |
| フォールバック（既定内容）付き `ng-content` | 0 | Angular 18 以降の機能だが未使用 |

### 代表イディオム

**(a) ラベル + 値（最頻 36 回）** — `labeled-row.component.html`

```html
<div class="label-container">{{label()}}</div>
<div class="content"><ng-content></ng-content></div>
```

**(b) パネル + 追加ボタン枠** — `editable-section.component.html`

```html
@if (!disableEditable() && !inEditMode() && editable()) {
  <ng-content select="[extra-buttons]"></ng-content>
}
<ng-content select="[search-button]"></ng-content>
...
<ng-content></ng-content>
```

編集モードでだけボタン枠を出す、という**状態に応じたスロットの出し分け**。

**(c) `mat-menu` ラッパ（再投影 3 件）** — `menu.component.html`

```html
<mat-menu>
  <div class="results"><ng-content></ng-content></div>
  <div #refFixedOptions><ng-content select="[fixedOptions]"></ng-content></div>
</mat-menu>
```

`<ng-content>` を `mat-menu` の内側に置く = MatMenu の `ng-content` へ流す再投影。

**(d) 投影の有無を DOM で判定** — 同ファイル 54 行目

```html
@if (fixedOptionsSubheader() || refFixedOptions.hasChildNodes()) {
  <mat-divider></mat-divider>
}
```

投影されたか分からない問題を、テンプレート参照変数 + `hasChildNodes()` で解決している。プロジェクト全体でもここ 1 箇所のみ。

**(e) カード型の多スロット** — `table-card.component.html`（7 スロット）

```html
<ng-content select="mat-checkbox"></ng-content>
<ng-content select="sm-experiment-type-icon-label"></ng-content>
<ng-content select="[sm-name-icon]"></ng-content>
...
```

レイアウト枠だけ決めて、中身の部品は呼び出し側が差す設計。

## 6. まとめ

- 定義は **1 スロット + デフォルト/属性セレクタ** が基本形。クラス・要素セレクタは例外的
- 実際に投影している 263 件のうち 188 件は Material 由来。自社 `ng-content` の出番は限定的
- 名前付きスロットは「用意はするが使われない」割合が高い（定義 44% に対し使用 16%）
- 再投影は 3 件のみ、しかも全部 `mat-menu` ラッパ。深い受け渡しは `ng-template` + `ngTemplateOutlet` 側に寄せている（[02](02_ng-content-再投影.md) 参照）
- フォールバック内容つき `ng-content` は未使用。バージョン的には使えるので、空スロット対策の余地あり
