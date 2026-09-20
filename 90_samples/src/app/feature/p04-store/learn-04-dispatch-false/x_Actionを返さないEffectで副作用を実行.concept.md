# Actionを返さないEffectで副作用を実行

## 関数詳細

`createEffect(source, { dispatch: false })` は、受け取ったActionから副作用を実行し、新しいActionをStoreへdispatchしない。

## どういうケースで使用するか

ログ出力、通知表示、画面遷移など、処理後にStoreの状態を更新する必要がない場合に使用する。

## 注意点

`dispatch: false` を省略すると、Effectの出力をActionとしてdispatchしようとする。状態更新が必要な処理では、成功・失敗Actionを返す通常のEffectを使用する。
