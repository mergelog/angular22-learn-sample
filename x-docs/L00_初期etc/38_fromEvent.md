`fromEvent()` は、**イベントを Observable に変換する RxJS 関数**です。

たとえばブラウザの `click` や `keydown`、`scroll` などを、RxJS の `pipe()` で扱える形にします。

```ts
import { fromEvent } from 'rxjs';

const button = document.querySelector('button')!;

fromEvent(button, 'click').subscribe(event => {
  console.log(event);
});
```

イメージはこれです。

```text
ユーザーがクリック
    ↓
DOM の click イベント発生
    ↓
fromEvent()
    ↓
Observable として流れる
    ↓
subscribe / pipe で処理
```

重要なのは、`fromEvent()` 自体がクリックを発生させるわけではありません。

```ts
fromEvent(button, 'click')
```

は、

> 「この button の click イベントが発生したら、そのイベントを Observable に流してください」

という意味です。

Angularで実務的なのは、たとえばウィンドウのリサイズです。

```ts
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

fromEvent(window, 'resize')
  .pipe(
    debounceTime(300),
    map(() => window.innerWidth)
  )
  .subscribe(width => {
    console.log(width);
  });
```

リサイズ中は大量にイベントが来ます。

```text
resize
resize
resize
resize
resize
```

そこで、

```ts
debounceTime(300)
```

を組み合わせて、

```text
resize → resize → resize → 300ms静止 → widthを取得
```

のようにできます。

最近学んでいる演算子とかなり相性がいいです。

| 書き方              | 意味               | 例                    |
| ---------------- | ---------------- | -------------------- |
| `fromEvent()`    | イベントをObservable化 | click、scroll、keydown |
| `debounceTime()` | イベントが止まるまで待つ     | resize、入力            |
| `throttleTime()` | 一定時間の連打を無視       | click、scroll         |
| `auditTime()`    | 一定間隔で最新値を出す      | scroll、mousemove     |
| `pairwise()`     | 前回と今回を比較         | スクロール方向判定            |

たとえばスクロール方向判定なら、

```ts
fromEvent(window, 'scroll')
  .pipe(
    map(() => window.scrollY),
    pairwise()
  )
  .subscribe(([prev, current]) => {
    console.log(current > prev ? '下' : '上');
  });
```

となります。

Angularでは購読解除も重要なので、コンポーネント内なら現在はこういう形が自然です。

```ts
import { Component, DestroyRef, inject } from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sample',
  template: ''
})
export class SampleComponent {
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    fromEvent(window, 'resize')
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        console.log(window.innerWidth);
      });
  }
}
```

一言でまとめると、

**`fromEvent()` = 「普通のイベントをRxJSの世界に持ち込む入口」**

です。

`map()` や `debounceTime()` などが「流れてきた値をどう処理するか」なのに対して、`fromEvent()` はそもそも**値が流れ始める元を作る側**です。
