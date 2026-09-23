# source 変更時に選択値を再計算

## 関数詳細

`linkedSignal({ source, computation })` は、`source` に依存しつつ手動更新もできる Signal を作る。`computation` は現在の `source` と直前の `source`・値を受け取り、新しい値を決める。

## どういうケースで使用するか

選択肢の更新後も同じ項目を選び続け、項目が消えた場合だけ既定値へ戻すとき。

## 注意点

初回の `previous` は `undefined`。`source` の変更後、再計算は `linkedSignal` を次に読み取るときに行われる。
