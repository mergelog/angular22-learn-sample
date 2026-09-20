# ng-content の再投影（親 → 子 → 孫）QA

対象サンプル: `90_samples/src/app/feature/p03-compo/c01-ng-content/`（親 = `c01-ng-content` / 子 = `child` / 孫 = `grand`）

## Q. 親から孫（grand）へ `ng-content` で受け渡しできるか

できます。ただし「親が孫へ直接」ではなく、**子が受け取ったものを孫へ中継する（再投影）** 形になります。

子が自分の `<ng-content />` を、孫のタグの中に置くだけです。

```html
<!-- child.html -->
<app-c01-grand>
  <ng-content />
</app-c01-grand>
```

Angular 22 での実測結果。親が書いた `<p class="p">from parent</p>` が孫のデフォルトスロットまで届きます。

```html
<tmp-grand>
  <div class="g-head"></div>
  <div class="g-body"><p class="p">from parent</p></div>
</tmp-grand>
```

## Q. 孫側の `select` にマッチさせられるか

そのままではマッチしません。孫から見えているのは「`ng-content` というノード」であって、親が書いた `<h3 header>` の属性ではないためです。結果、`select` のないデフォルトスロットへ落ちます。

```html
<!-- NG: 孫の select="[header]" には当たらない -->
<app-c01-grand>
  <ng-content select="[header]" />
</app-c01-grand>
```

```html
<!-- 実測: g-head が空で、g-body に入る -->
<div class="g-head"></div>
<div class="g-body"><h3 header="">H</h3></div>
```

`ng-content` 自身に属性を付けると、孫の `select` がその属性を見てマッチします。

```html
<!-- OK -->
<app-c01-grand>
  <ng-content select="[header]" header />
</app-c01-grand>
```

```html
<!-- 実測: g-head に入る -->
<div class="g-head"><h3 header="">H</h3></div>
<div class="g-body"></div>
```

## Q. 同じ内容を 2 か所に出せるか

出せません。1 つのコンテンツは 1 つのスロットにしか入りません。同じセレクタの `ng-content` が複数ある場合、入るのは片方だけです（実測では後ろ側）。

```html
<div class="d1"><ng-content /></div>
<div class="d2"><ng-content /></div>
```

```html
<!-- 実測 -->
<div class="d1"></div>
<div class="d2"><p>X</p></div>
```

つまり「子でも表示しつつ孫にも渡す」は `ng-content` では不可能です。

## Q. 複数箇所・深い階層へ渡したい場合は

`ng-content` ではなく `<ng-template>` を渡し、`ngTemplateOutlet` で展開します。これなら何度でも描画でき、コンテキスト（行データなど）も渡せます。

```html
<!-- 親 -->
<ng-template #row let-item>...</ng-template>
<app-child [rowTemplate]="row" />
```

```html
<!-- 子や孫 -->
<ng-container *ngTemplateOutlet="rowTemplate(); context: { $implicit: item }" />
```

## Q. 実務プロジェクトに再投影パターンはあるか（learn-ClearML-pro / 実験管理画面）

調査範囲は `src/app/features/experiments` と `src/app/webapp-common/experiments`（html 39 本）。

**形としては 1 箇所だけ存在。ただし実際に内容が流れている使われ方はしていない。**

`ng-content` の使用は 4 コンポーネントのみ。

| 箇所 | 形 |
| --- | --- |
| `features/experiments/containers/experiment-info-navbar/experiment-info-navbar.component.html:7` `select="[refresh]"` | `<div>` の中。普通の 1 段投影 |
| `webapp-common/experiments/dumb/experiment-details/experiment-details.component.html:1` | ルート直下。1 段 |
| `webapp-common/experiments/dumb/experiment-info-header/experiment-info-header.component.html:27` `select=".linkToOrigin"` | `<div>` の中。1 段（クラスセレクタ例） |
| `webapp-common/experiments/shared/components/experiment-menu/experiment-menu.component.html:136` `select="[extended]"` | **`<mat-menu>` の中。再投影の形** |

1 段投影の親の実例は `experiment-output.component.html:24` の `<span class="close-button" refresh>`。

### 唯一の再投影

`experiment-menu` の `<ng-content select="[extended]">` は `<mat-menu>` タグの内側にあります。MatMenu 自身のテンプレートが次の形なので、親 → `sm-experiment-menu` → `mat-menu` と 3 段目まで流れる構造です。

```html
<ng-template>…<div class="mat-mdc-menu-content"><ng-content></ng-content></div>…</ng-template>
```

ただし `[extended]` に内容を渡している親は無く、利用箇所 2 つ（`experiments.component.html:141`、`experiment-info-header.component.html:85`）はどちらも属性だけ渡して空のまま閉じています。OSS 版 / 有償版の差分を後から差し込むための拡張フックです。

なお `sm-experiment-menu-extended` は合成ではなく**継承**（同じ templateUrl を共有）なので、深い `ng-content` チェーンではありません。

### 深い受け渡しは ng-template 方式

実務で階層をまたぐ受け渡しは `ngTemplateOutlet` 側が使われています。

- `experiments.component.html:140` で `<ng-template #contextMenuExtendedTemplate let-contextExperiment>` を定義
- `experiments.component.html:94` で `[contextMenuTemplate]="contextMenuExtendedTemplate"` として入力で渡す
- `experiments-table.component.html:1` で `*ngTemplateOutlet` 展開

行ごとに何度も描画する・階層が深い・コンテキストを渡したい、という条件では `ng-content` の再投影では対応できないためです。

## 検証方法

Angular 22（vitest + jsdom）で一時 spec を作成し、実際の描画 HTML を確認。本ドキュメント内の「実測」は全てその出力です。検証後、一時 spec は削除済み。
