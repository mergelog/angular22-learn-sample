# 連続する同じ値だけを除く

## 関数詳細

`distinctUntilChanged()` は最初の値を流し、その後は直前に流した値と異なる値だけを流す。

## どういうケースで使用するか

同じ状態が連続して通知されたとき、重複する更新処理を省きたい場合に使用する。

## 注意点

離れて現れた同じ値は再び流れる。比較関数を省略すると `===` で比較するため、オブジェクトは内容が同じでも別の参照なら流れる。

## 比較関数の例

```ts
of(
  { id: 1, name: 'A' },
  { id: 1, name: 'B' },
  { id: 2, name: 'C' },
)
  .pipe(distinctUntilChanged((previous, current) => previous.id === current.id))
  .subscribe((value) => console.log(value));
```

比較関数が `true` を返すと現在の値を除く。この例では `id` が同じ `B` を除き、`A` と `C` が出力される。
