# 複数の購読をまとめて解除

読み方

```
// interval(500)が返すのがObservable
// で、.subscribe してるだけ
this.subscriptions.add(interval(500).subscribe((count) => this.fastCount.set(count + 1)));
```

## 関数詳細

`new Subscription()` は、複数の Subscription や終了処理を `add()` でまとめられる親 Subscription を作成する。親の `unsubscribe()` を呼ぶと、追加した購読もすべて解除される。

## どういうケースで使用するか

同じタイミングで終了させたい複数の手動購読を、1か所で管理する場合に使用する。

## 注意点

一度 `unsubscribe()` した Subscription は再利用できない。Angular では `AsyncPipe` や `takeUntilDestroyed()` で管理できる場合はそちらを優先し、手動購読をまとめる必要がある場合に使用する。
