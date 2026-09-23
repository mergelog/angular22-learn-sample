# 状態とイベント処理を Feature にまとめる

## 関数詳細

`signalStoreFeature()` で `withState()`、`withReducer()`、`withEventHandlers()` を `withCounterEvents()` にまとめ、`signalStore(withCounterEvents())` で使う。イベントの発火と表示結果は `learn-10` と同じ。

## どういうケースで使用するか

状態とイベント処理をひとまとまりにし、Store 間で再利用したいとき。

## 注意点

Feature にまとめてもイベントは Store ごとに自動分離されない。この画面では `provideDispatcher()` でイベントを画面内に閉じる。受信ログ用の `CounterEventLog` も画面ごとに提供する。
