では `effect()` と `afterRenderEffect()` の違いです。

まず結論です。

| API                   | いつ動く？                         | 主な用途                           |
| --------------------- | ----------------------------- | ------------------------------ |
| `effect()`            | Signal変化を検知し、AngularがDOM更新する前 | `localStorage`、ログ、外部状態同期       |
| `afterRenderEffect()` | Signal変化を検知し、AngularがDOM更新した後 | DOMサイズ取得、Canvas、チャート、外部UIライブラリ |

Angular公式も、通常の `effect()` はDOM更新前に実行され、DOMを直接読む・書く必要がある場合は `afterRenderEffect()` を使う、としています。([Angular][1])

まず普通の `effect()` です。

```ts
readonly width = signal(300);

constructor() {
  effect(() => {
    console.log('width:', this.width());
  });
}
```

流れは、

```text
width.set(500)
    ↓
effect が反応
    ↓
Angular がDOMを更新
```

と考えてください。

そこで、こういうことをしたいとします。

```html
<div #box [style.width.px]="width()">
  BOX
</div>
```

Signalを変更したあと、

```ts
width.set(500);
```

実際に描画された `<div>` の幅を取得したい。

普通の `effect()` で、

```ts
effect(() => {
  this.width();

  const actualWidth =
    this.box().nativeElement.getBoundingClientRect().width;

  console.log(actualWidth);
});
```

とすると問題があります。

`effect()` が動いた時点では、AngularのDOM更新がまだ完了していない可能性があるからです。([Angular][1])

そこで、

```ts
afterRenderEffect(() => {
  this.width();

  const actualWidth =
    this.box().nativeElement.getBoundingClientRect().width;

  console.log(actualWidth);
});
```

です。

流れが、

```text
width.set(500)
    ↓
Signal変更
    ↓
Angularがテンプレートを更新
    ↓
DOMに width=500px が反映
    ↓
afterRenderEffect()
    ↓
実際のDOMを読む
```

になります。

ここが本質です。

**`effect()` = Signalを見て何かする**

**`afterRenderEffect()` = Signalを見て、DOM更新後に何かする**

です。

実際のコードを一度まとめます。

```ts
import {
  Component,
  ElementRef,
  afterRenderEffect,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-sample',
  template: `
    <button (click)="increase()">
      幅を広げる
    </button>

    <div
      #box
      [style.width.px]="width()"
      style="border: 1px solid; height: 100px;"
    >
      BOX
    </div>
  `,
})
export class SampleComponent {

  // 見る順: 1
  readonly width = signal(300);

  // 見る順: 2
  // template の #box を取得
  readonly box =
    viewChild.required<ElementRef<HTMLDivElement>>('box');

  constructor() {

    // 見る順: 3
    afterRenderEffect(() => {

      // 見る順: 4
      // width() を読むので、
      // width が変化すると再実行対象になる。
      this.width();

      // 見る順: 5
      // この時点ではAngularのDOM描画後。
      const actualWidth =
        this.box().nativeElement.getBoundingClientRect().width;

      console.log('実際の幅:', actualWidth);
    });
  }

  // 見る順: 6
  increase(): void {
    this.width.update(width => width + 100);
  }
}
```

ボタンを押すと、

```text
300
↓
400
↓
500
↓
600
```

とSignalが変化し、

```text
Signal変更
↓
DOM更新
↓
afterRenderEffect
↓
実際のDOMサイズを取得
```

となります。

そして `afterRenderEffect()` も名前の通り **Effect** なので、Signal依存を追跡します。

```ts
afterRenderEffect(() => {
  this.width();
});
```

なら `width` が変化したときにdirtyになり、レンダリング完了後に実行されます。単なる「毎回レンダリング後に必ず実行」ではありません。([Angular][2])

ここで似たAPIが3つあります。

| API                   | Signal追跡 | 実行タイミング          |
| --------------------- | -------- | ---------------- |
| `afterNextRender()`   | しない      | 次の描画後に1回         |
| `afterEveryRender()`  | しない      | 毎回の描画後           |
| `afterRenderEffect()` | **する**   | 依存Signalが変化した描画後 |

`afterNextRender()` は「次のレンダリング後に1回」、`afterEveryRender()` は「各レンダリング後」、`afterRenderEffect()` はSignal依存によって必要になったときにレンダリング後実行されます。([Angular][3])

たとえばチャートなら `afterRenderEffect()` が分かりやすいです。

```ts
afterRenderEffect(() => {
  const data = this.chartData();

  this.chart.update(data);
});
```

考え方は、

```text
chartData変更
↓
Angular側の画面描画
↓
Canvas等のDOMが準備済み
↓
chart.update()
```

です。

なお、現在の `afterRenderEffect()` には、

```text
earlyRead
write
mixedReadWrite
read
```

というフェーズもあります。AngularはDOMの読み書きを分離してレイアウト処理の無駄を減らすため、可能なら `read` と `write` を明示することを推奨しています。([Angular][2])

例えば「DOMサイズを読むだけ」なら、

```ts
afterRenderEffect({
  read: () => {
    const width =
      this.box().nativeElement.getBoundingClientRect().width;

    console.log(width);
  },
});
```

です。

今の段階ではフェーズ4種類を暗記する必要はありません。

まず、

```text
effect()
    ↓
DOMに依存しない副作用

afterRenderEffect()
    ↓
DOM描画後でないと困る副作用
```

これを押さえれば十分です。

特に重要なのは、**`afterRenderEffect()` は `ngAfterViewInit()` の単なる新しい名前ではない**という点です。

`ngAfterViewInit()` はView初期化時に1回。

`afterRenderEffect()` はSignalの依存関係を持ち、**Signalが変わるたびに必要なら再実行される**。

ここは実務コードを読むときにかなり重要な違いです。([Angular][2])

次は `effect()` 学習の仕上げとして、**「では `effect()` は実務でどこまで使うのか。使いすぎると何がまずいのか」**をやると、設計判断までつながります。

[1]: https://angular.dev/guide/signals/effect?utm_source=chatgpt.com "Side effects for non-reactives APIs • Angular"
[2]: https://angular.dev/api/core/afterRenderEffect?utm_source=chatgpt.com "afterRenderEffect • Angular"
[3]: https://angular.dev/api/core/afterEveryRender?utm_source=chatgpt.com "afterEveryRender • Angular"
