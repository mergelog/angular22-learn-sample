`ngAfterContentInit` は、**`ng-content` で外から差し込まれた内容の初期化が終わった後**に1回だけ呼ばれます。

`ngAfterViewInit` との違いはここです。

| Hook                 | 何が完成した後？                 | 主に使うもの                                 |
| -------------------- | ------------------------ | -------------------------------------- |
| `ngAfterContentInit` | 親から `ng-content` に渡された内容 | `contentChild()` / `contentChildren()` |
| `ngAfterViewInit`    | 自分自身のテンプレート全体            | `viewChild()` / `viewChildren()`       |

たとえば子コンポーネントがこうだとします。

```ts
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <ng-content />
    </div>
  `,
})
export class CardComponent implements AfterContentInit {
  readonly title = contentChild('title');

  ngAfterContentInit() {
    console.log(this.title());
  }
}
```

親はこうです。

```html
<app-card>
  <h2 #title>実験結果</h2>
</app-card>
```

ここで、

```html
<h2 #title>実験結果</h2>
```

は `CardComponent` 自身が書いた要素ではありません。

**親から差し込まれた Content** です。

そのため子から取得するときは、

```ts
contentChild('title')
```

になり、その Content が初期化された直後が、

```ts
ngAfterContentInit()
```

です。

流れはざっくりこうです。

```text
親
<app-card>
  <h2>実験結果</h2>
</app-card>

        ↓ 渡す

子
<ng-content />

        ↓ 差し込まれる

ngAfterContentInit
「差し込まれたContentの初期化が終わった」
```

一方、子自身のテンプレートに直接こう書いてあれば、

```html
<div #box>カード内部</div>
```

これは `Content` ではなく **View** なので、

```ts
viewChild('box')
ngAfterViewInit()
```

の世界です。

かなり短く覚えるなら、

> `ngAfterContentInit`
> **外から差し込まれたものが完成**

> `ngAfterViewInit`
> **自分の画面が完成**

です。

なお、`ngAfterContentInit` も `ngAfterViewInit` も**初期化時の1回だけ**です。以後の変更ごとに呼ばれるわけではありません。
