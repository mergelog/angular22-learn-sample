# イベント発火から状態更新と受信を確認

## 関数詳細

`eventGroup()` と `type<number>()` で数値を持つ `add` イベントを定義する。`Dispatcher.dispatch()` はイベントを渡して発火し、`injectDispatch()` は `dispatch.add(3)` の形で発火する。`withReducer()` と `on()` が `count` を更新し、`withEventHandlers()` 内の `Events.on()` が更新後の値をログに出す。

## どういうケースで使用するか

同じ出来事で状態更新とログ出力などの処理を分けたいとき。

## 注意点

`injectDispatch()` は Angular の injection context 内で呼ぶ。ターミナルでは `runInInjectionContext()` を使い、`Dispatcher` / `Events` / `ReducerEvents` を明示的に提供する。
