了解です。今後 Angular の親子関係は、**「子がこう」「親がこう」「結果こうなる」**を毎回セットで書きます。

今回の `ng-content` も、その形で整理するとこうです。

まず一番単純な形です。

子の `app-panel` 側：

```html
<div class="panel">
  <ng-content />
</div>
```

親側：

```html
<app-panel>
  <app-chart />
  <app-box />
</app-panel>
```

結果のイメージ：

```html
<div class="panel">
  <app-chart />
  <app-box />
</div>
```

つまり、

```html
<ng-content />
```

は、

> 親が `<app-panel>...</app-panel>` の中に書いたものを、全部ここへ持ってきて

という意味です。

次に、種類ごとに分けたい場合です。

子の `app-panel` 側：

```html
<div class="panel">
  <header>
    <ng-content select="[header]" />
  </header>

  <main>
    <ng-content select="[body]" />
  </main>
</div>
```

親側：

```html
<app-panel>
  <h2 header>歩留まりグラフ</h2>

  <app-chart body />
  <app-box body />
</app-panel>
```

子は、

```html
<ng-content select="[header]" />
```

で、

> `header` という属性が付いているものをここへ持ってきて

と言っています。

親には、

```html
<h2 header>
```

があります。

なのでここに入ります。

一方、

```html
<ng-content select="[body]" />
```

は、

> `body` 属性が付いているものをここへ持ってきて

です。

親には、

```html
<app-chart body />
<app-box body />
```

があります。

だから結果は、

```html
<div class="panel">
  <header>
    <h2>歩留まりグラフ</h2>
  </header>

  <main>
    <app-chart />
    <app-box />
  </main>
</div>
```

となります。

タグ名で選ぶこともできます。

子側：

```html
<div class="panel">
  <ng-content select="app-chart" />
</div>
```

親側：

```html
<app-panel>
  <app-chart />
  <app-box />
</app-panel>
```

この場合、子は、

> `app-chart` だけ持ってきて

と言っています。

なので結果は、

```html
<div class="panel">
  <app-chart />
</div>
```

になります。

`app-box` は `select="app-chart"` に一致しないので入りません。

クラスでもできます。

子側：

```html
<div class="panel">
  <ng-content select=".main" />
</div>
```

親側：

```html
<app-panel>
  <app-chart class="main" />
  <app-box />
</app-panel>
```

子は、

> `class="main"` が付いたものだけ持ってきて

と言っています。

結果：

```html
<div class="panel">
  <app-chart class="main" />
</div>
```

さらに、指定されたもの以外を全部受け取ることもできます。

子側：

```html
<div class="panel">
  <header>
    <ng-content select="[header]" />
  </header>

  <main>
    <ng-content />
  </main>
</div>
```

親側：

```html
<app-panel>
  <h2 header>タイトル</h2>

  <app-chart />
  <app-box />
</app-panel>
```

まず、

```html
<ng-content select="[header]" />
```

に、

```html
<h2 header>タイトル</h2>
```

が入ります。

そして残った、

```html
<app-chart />
<app-box />
```

が、

```html
<ng-content />
```

に入ります。

結果：

```html
<div class="panel">
  <header>
    <h2>タイトル</h2>
  </header>

  <main>
    <app-chart />
    <app-box />
  </main>
</div>
```

ここはかなり重要で、

```html
<ng-content />
```

は単に「全部」ではなく、

**先に `select` 付きの `ng-content` に振り分けられなかった残りを受け取る**

という使い方もできます。

## まずはこの3つを覚えると十分です。

```html
<ng-content />
```
→ 親が書いた中身を受け取る


```html
<ng-content select="[header]" />
```
→ 親の中から `header` 属性付きだけ受け取る


```html
<ng-content select="app-chart" />
```
→ 親の中から `app-chart` だけ受け取る

今後はこのように、片側だけ見せずに必ず親子セットで説明します。
