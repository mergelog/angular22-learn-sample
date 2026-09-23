# 状態とイベント処理を Feature にまとめる

## 関数詳細

`signalStoreFeature()` は `withState()`、`withReducer()`、`withEventHandlers()` を `withCounterEvents()` にまとめる。`signalStore(withCounterEvents())` で利用する。イベントの発火と実行結果は `learn-10` と同じ。

## どういうケースで使用するか

状態とイベント処理をひとまとまりにして、別の Store でも使いたいとき。

## 注意点

Feature にまとめてもイベントは自動的に Store ごとへ分離されない。同じスコープで複数の Store がこの Feature を使うと、同じ `add` イベントを受ける。
