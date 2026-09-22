# Signalとeffectで入力を間引く

## 関数詳細

`effect` で入力 Signal を監視し、`setTimeout` 後に結果を更新する。次の入力時に `onCleanup` で前のタイマーを破棄することで、最後の入力だけを反映する。

## どういうケースで使用するか

Observableへ変換せず、Signal内で小規模な入力待機処理を完結させたい場合。

## 注意点

Signalには `debounceTime` や `debounce` に相当する標準APIがない。複雑な非同期処理や複数ストリームの制御にはRxJSを使用する。
