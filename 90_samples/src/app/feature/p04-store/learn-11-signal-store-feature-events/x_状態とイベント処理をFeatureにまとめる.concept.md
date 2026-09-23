# 状態とイベント処理を Feature にまとめる

## 関数詳細

`signalStoreFeature()` で `withState()`、`withTrackedReducer()`、`withEventHandlers()` を `withCounterEvents()` にまとめる。`withDevtools()` を追加した Store で使う。イベントの発火と表示結果は `learn-10` と同じ。

## どういうケースで使用するか

状態とイベント処理をひとまとまりにし、Store 間で再利用したいとき。

## 注意点

Feature にまとめてもイベントは Store ごとに自動分離されない。この画面では `provideDispatcher()` でイベントを画面内に閉じる。Redux DevTools の「NgRx SignalStore」で `[Counter Feature] add` と `count` の変化を確認できる。
