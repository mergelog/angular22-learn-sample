# ClearML Web の `ng-content select` 自分用メモ

## まず結論

ClearML Web では `ng-content select` は実際にかなり使われている。

ただし、Angular 全体でどこでも頻出するというより、

**共通UIに「ここへ外からHTMLを差し込んでよい」という差し込み口を作る用途**

で使われている。

ClearML Web 内では、

* `ng-content select` の定義: 41個
* 実際に使われているスロット: 26個
* 現在使われていないスロット: 15個

だった。

なので、

> 見かけたとき意味が分かればよい程度

ではなく、

> ClearML Web の共通コンポーネントを読むなら、普通に理解しておいた方がよい

くらいの位置づけ。

---

## 一番基本

共通コンポーネント側:

```html
<div class="recent-header">
  <div>RECENT TASKS</div>

  <ng-content select="[header-buttons]"></ng-content>
</div>
```

利用側:

```html
<sm-dashboard-experiments>

  <div header-buttons>
    <button>MANAGE WORKERS AND QUEUES</button>
  </div>

</sm-dashboard-experiments>
```

ここでは、

```html
<div header-buttons>
```

が、

```html
<ng-content select="[header-buttons]">
```

の場所へ入る。

つまり、

```text
呼び出し側

<div header-buttons>
  ボタン
</div>

        ↓

共通コンポーネント

<ng-content select="[header-buttons]">
```

という関係。

`ng-content` は、

**「外から渡されたHTMLを、ここへ表示する」**

ための仕組み。

---

## `select` は「どれをここへ入れるか」

例えば、

```html
<ng-content select="[header-buttons]"></ng-content>
```

なら、

```html
<div header-buttons>
```

を探す。

```html
<ng-content select="[footer]"></ng-content>
```

なら、

```html
<div footer>
```

を探す。

つまり、

```text
select="[xxx]"
```

は、

```text
xxx 属性が付いているものをここへ入れて
```

くらいに考えればよい。

---

## ClearML Web では複数の差し込み口を作っている

例えば `sm-table-card` はかなり分かりやすい。

共通カード側に、

```html
<ng-content select="mat-checkbox"></ng-content>

<ng-content select="[sm-name-icon]"></ng-content>

<ng-content select="[sm-name-version]"></ng-content>

<ng-content select="[sm-mini-tags]"></ng-content>

<ng-content select="sm-status-icon-label"></ng-content>

<ng-content select=".uptime"></ng-content>
```

のように複数の差し込み口がある。

利用側では、

```html
<sm-table-card>

  <div sm-name-icon>...</div>

  <div sm-name-version>...</div>

  <div sm-mini-tags>...</div>

  <sm-status-icon-label ...></sm-status-icon-label>

  <mat-checkbox></mat-checkbox>

</sm-table-card>
```

と書く。

Angular が、それぞれを対応する場所へ振り分ける。

イメージは、

```text
sm-table-card

├─ checkbox を入れる場所
├─ 名前アイコンを入れる場所
├─ version を入れる場所
├─ tag を入れる場所
└─ status を入れる場所
```

という「枠」が先に作ってある。

呼び出し側は、その枠へ必要な部品だけ渡す。

---

## なぜ `input()` ではなく `ng-content` を使うのか

例えばボタンを渡したいだけなら、

```ts
buttonLabel = input<string>();
```

でもできそうに見える。

でも実際には、

```html
<button
  (click)="createDataset()"
  [disabled]="disabled()"
>
  <mat-icon>add</mat-icon>
  NEW DATASET
</button>
```

のように、

* HTML
* イベント
* Angular Material
* 条件分岐
* icon
* disabled

などをまとめて渡したいことがある。

これを全部 `input()` にすると、

```ts
buttonLabel
buttonIcon
buttonDisabled
buttonClick
buttonColor
...
```

のように共通コンポーネントが肥大化する。

そこで、

```html
<ng-content select="[create-button]">
```

だけ用意して、

```html
<button create-button ...>
```

を丸ごと渡す。

これはかなり実務的。

---

## ClearML Web での典型例

### create-button

共通画面枠:

```html
<ng-content select="[create-button]"></ng-content>
```

Dataset画面:

```html
<button create-button>
  NEW DATASET
</button>
```

Pipeline画面なら、

```html
<button create-button>
  NEW PIPELINE
</button>
```

のように差し替えられる。

---

### empty-state

共通側:

```html
<ng-content select="[empty-state]"></ng-content>
```

利用側:

```html
<div empty-state>
  NO DATASETS TO SHOW
</div>
```

同じページ構造を使いながら、空状態だけ画面ごとに変えられる。

---

### subtitle

検索結果の共通行:

```html
<div class="sub-title">
  <ng-content select="[subtitle]"></ng-content>
</div>
```

利用側:

```html
<sm-result-line>

  <ng-container subtitle>
    <span>Project A</span>
  </ng-container>

</sm-result-line>
```

Task、Model、Pipeline、Projectなど、いろいろな検索結果が同じ `sm-result-line` を使える。

---

## `select` には3種類ある

### 属性

一番よく使われている。

```html
<ng-content select="[footer]"></ng-content>
```

利用側:

```html
<div footer>...</div>
```

ClearML Webではこれが大半。

---

### 要素名

```html
<ng-content select="mat-checkbox"></ng-content>
```

利用側:

```html
<mat-checkbox></mat-checkbox>
```

これは、

```text
mat-checkbox をここへ入れる
```

という意味。

---

### class

```html
<ng-content select=".uptime"></ng-content>
```

利用側:

```html
<span class="uptime">...</span>
```

`.` があるので class。

ここは普通のCSS selectorと同じ感覚。

---

## `[extended]` はどうだったか

最初に見つけた、

```html
<ng-content select="[extended]"></ng-content>
```

は、Experiment Menu の拡張用スロット。

ただし調査時点では、

```html
<sm-experiment-menu-extended>
```

を使っている場所はあるものの、

```html
<button extended>
```

のように実際に内容を渡している場所はなかった。

つまり、

```text
差し込み口は存在する
でも今は何も差し込まれていない
```

という状態。

なので、

```text
ng-content が未使用
```

ではなく、

```text
[extended] というその特定スロットが未使用
```

という理解が正しい。

ClearML Web 全体では `ng-content select` は普通に使われている。

---

## 重要: 属性名だけ検索しても判断できない

例えば、

```html
<ng-content select="[extra-buttons]">
```

を見つけて、

プロジェクト全体で、

```html
<button extra-buttons>
```

を検索しても、それだけではどこへ投影されるか分からない。

例えば、

```html
<sm-editable-section>

  <sm-scroll-textarea>

    <button extra-buttons>
      EDIT
    </button>

  </sm-scroll-textarea>

</sm-editable-section>
```

なら、このボタンの一番近い親は、

```html
<sm-scroll-textarea>
```

なので、

`sm-scroll-textarea` の `[extra-buttons]` に入る。

外側の、

```html
<sm-editable-section>
```

の `[extra-buttons]` ではない。

つまり、

**どのコンポーネントの直下に書かれているかを見る。**

これが重要。

---

## さらに重要: 子孫を勝手に探してくれるわけではない

例えば、

```html
<sm-menu>

  <div class="options">

    <div fixedOptions>
      ...
    </div>

  </div>

</sm-menu>
```

があったとしても、

```html
<ng-content select="[fixedOptions]">
```

が内側の `fixedOptions` を勝手に掘って見つけてくれるわけではない。

`sm-menu` から見ると直接渡されているのは、

```html
<div class="options">
```

だから。

使いたければ、

```html
<sm-menu>

  <div class="options">
    ...
  </div>

  <div fixedOptions>
    ...
  </div>

</sm-menu>
```

のようにする必要がある。

ここはハマりやすい。

---

# 自分用の覚え方

`ng-content` を見たら、

```text
ここは外からHTMLが入ってくる場所
```

と考える。

`select` があったら、

```text
その中でも、指定された目印付きのHTMLだけ入る
```

と考える。

例えば、

```html
<ng-content select="[footer]">
```

なら、

```text
footer と目印を付けたHTMLを
ここへ入れてください
```

という意味。

---

# ClearML Webを読むときの優先順位

まずこの3つだけ分かればよい。

```text
1. <ng-content>
   → 外からHTMLが入る

2. select="[xxx]"
   → xxx属性付きのHTMLだけ入る

3. どのコンポーネントの直下にあるかを見る
   → 投影先の判定に重要
```

その後で、

```text
複数スロット
多段投影
未使用スロット
```

を理解すれば十分。

---

# 一言でいうと

```text
ng-content select
=
共通コンポーネントに用意された
「名前付きHTML差し込み口」
```

ClearML Webでは、

**共通レイアウトを壊さず、画面ごとの差分だけ差し込む**

ために使われている。

特に、

* TableCard
* Nested Project View
* ResultLine
* Card
* Markdown Editor

あたりを見ると理解しやすい。

---

> <ng-content /> のようにselectがない場合、丸ごと持ってくる。であってますか

概ね合っています。

`<ng-content />` に `select` がない場合は、

> 呼び出し側から渡されたコンテンツのうち、特定の `select` に振り分けられなかったものを全部ここに入れる

という理解が正確です。

例えばこれだけなら、

```html
<app-card>
  <p>A</p>
  <button>B</button>
</app-card>
```

子側が、

```html
<div class="card">
  <ng-content />
</div>
```

なら、`<p>` も `<button>` も全部ここに入ります。

ただし、こういう場合は少し違います。

```html
<header>
  <ng-content select="[header]" />
</header>

<main>
  <ng-content />
</main>
```

呼び出し側が、

```html
<app-card>
  <h2 header>タイトル</h2>
  <p>本文</p>
  <button>保存</button>
</app-card>
```

なら、

* `<h2 header>` → `[header]` のスロット
* `<p>` と `<button>` → `select` なしの `<ng-content />`

に入ります。

なので、自分用にはこう覚えるのが一番よいです。

```text
<ng-content select="[xxx]" />
→ xxx の目印付きだけ持ってくる

<ng-content />
→ それ以外を全部持ってくる
```

もし `select` 付きが一つもなければ、実質「丸ごと全部持ってくる」で大丈夫です。
