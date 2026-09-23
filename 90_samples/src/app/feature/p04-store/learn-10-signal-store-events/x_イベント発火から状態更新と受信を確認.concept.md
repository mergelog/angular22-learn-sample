# イベント発火から状態更新と受信を確認

## 関数詳細

`eventGroup()` と `type<number>()` で `add` イベントを定義する。`Dispatcher.dispatch()` と `injectDispatch()` のどちらでも発火できる。`withReducer()` が `count` を更新し、`withEventHandlers()` が更新後の値を受信ログに追加する。

## どういうケースで使用するか

同じイベントを使って状態更新とログ出力などの処理を分けたいとき。

## 注意点

`injectDispatch()` はコンポーネントの injection context で作る。`provideDispatcher()` はこの画面のイベントを画面内に閉じる。受信ログ用の `CounterEventLog` は表示のための補助クラス。
