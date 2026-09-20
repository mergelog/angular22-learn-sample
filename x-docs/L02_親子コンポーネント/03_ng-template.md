
- ng-container でなければならないわけではありません。

<ng-template #chartTemplate>
  <app-chart />
</ng-template>

↓

<ng-container *ngTemplateOutlet="chartTemplate" />

とか

<div *ngTemplateOutlet="chartTemplate"></div> ※ただしこの場合は、実際のDOMに div が残ります。

で表示

---

今の段階では、

ng-template と ng-container はセットではない。ただし ng-template を画面に展開するとき、ng-container + ngTemplateOutlet の組み合わせをよく見る

と覚えるのが一番安全です。

---

> 今の段階ではっていうことは実務ではもっと複雑なんですね

そうです。実務ではもう一段あります。
ただし、複雑になる理由は ng-template 自体が難しいというより、**「テンプレートを値として扱い始める」**からです。
...

---

そうです。実務ではもう一段あります。

ただし、複雑になる理由は `ng-template` 自体が難しいというより、**「テンプレートを値として扱い始める」**からです。

単純な段階ではこうです。

親側：

```html
<ng-template #chartTemplate>
  <app-chart />
</ng-template>

<ng-container *ngTemplateOutlet="chartTemplate" />
```

これは、

```text
設計図を作る
↓
その設計図をここで表示する
```

だけです。

実務では、たとえば「親がテンプレートを子へ渡して、子が好きな場所で表示する」が出てきます。

親側：

```html
<app-panel>
  <ng-template #bodyTemplate>
    <app-chart />
  </ng-template>
</app-panel>
```

子 `app-panel` 側では、TypeScript でその `ng-template` を `TemplateRef` として受け取るようなことがあります。

```ts
@ContentChild('bodyTemplate')
bodyTemplate!: TemplateRef<unknown>;
```

子のHTML：

```html
<section class="panel">
  <header>タイトル</header>

  <main>
    <ng-container *ngTemplateOutlet="bodyTemplate" />
  </main>
</section>
```

流れはこうです。

```text
親
↓
ng-template という「設計図」を渡す

子
↓
TemplateRef として受け取る

子
↓
ngTemplateOutlet で好きな位置に展開

結果
↓
app-chart が panel の main に表示される
```

さらに実務では、そのテンプレートへデータまで渡します。

たとえば子が、

```html
<ng-container
  *ngTemplateOutlet="rowTemplate; context: { $implicit: item }"
/>
```

とすると、親側では、

```html
<ng-template #rowTemplate let-item>
  {{ item.name }}
</ng-template>
```

のように、

> 子が持っているデータを、親が定義したテンプレートへ渡す

ことまでできます。

ここまで来ると、

```text
ng-template
= 単なる非表示HTML
```

ではなく、

```text
ng-template
= 再利用可能な描画処理
```

に近くなってきます。

Angular Material などでも、この考え方はかなり使われています。

なので実務でよく見るレベルを順番に並べると、

```text
レベル1
ng-content
→ 親の中身をそのまま子へ差し込む

レベル2
ng-template + ngTemplateOutlet
→ 設計図をあとから表示する

レベル3
TemplateRef
→ その設計図をTypeScript側で扱う

レベル4
context / let-xxx
→ 設計図にデータを渡して描画する
```

です。

ただ、ClearML Webのような大きなAngularコードを読む目的なら、まず重要なのは **レベル1〜3** です。`ng-content`、`ng-template`、`ng-container`、`ngTemplateOutlet`、`TemplateRef` まで分かると、テンプレート周りで急に読めなくなるケースはかなり減ります。

