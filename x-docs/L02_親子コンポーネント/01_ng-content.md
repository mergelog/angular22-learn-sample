その場合、`<app-panel>` 側が単純に

```html
<ng-content />
```

を持っていれば、そのままで大丈夫です。

```html
<app-panel>
  <app-chart />
  <app-box />
</app-panel>
```

と書くと、`app-panel` の `<ng-content />` の位置に、2つとも順番どおり入ります。

たとえば `panel.html` が

```html
<section class="panel">
  <div class="panel__body">
    <ng-content />
  </div>
</section>
```

なら、イメージとしてはこうです。

```html
<section class="panel">
  <div class="panel__body">
    <app-chart />
    <app-box />
  </div>
</section>
```

つまり `ng-content` は「1個のコンポーネントだけ入る穴」ではなく、**その場所に書かれた中身をまとめて受け取る場所**です。

もし `app-chart` と `app-box` を別の場所に置きたいなら、`select` を使います。

```html
<section class="panel">
  <div class="panel__chart">
    <ng-content select="app-chart" />
  </div>

  <div class="panel__box">
    <ng-content select="app-box" />
  </div>
</section>
```

これなら

```html
<app-panel>
  <app-chart />
  <app-box />
</app-panel>
```

でも、`chart` と `box` を別々の場所へ振り分けられます。

なので整理すると、

* `<ng-content />` → 中身をまとめて全部入れる
* `<ng-content select="...">` → 条件に合うものだけ入れる

です。
