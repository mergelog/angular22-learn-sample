# 連続する同じキーの値を除く

## 関数詳細

`distinctUntilKeyChanged('category')` は、直前に流したオブジェクトと `category` が異なる場合だけ値を流す。最初の値は必ず流す。

第2引数に比較関数を渡すと、キーの値を独自の方法で比較できる。次の例は大文字・小文字を区別しない。

```ts
distinctUntilKeyChanged('category', (previous, current) =>
  previous.toLowerCase() === current.toLowerCase(),
)
```

比較関数には前回流した値と今回の値の `category` が渡される。`true` なら同じとみなして今回の値を流さず、`false` なら流す。

## どういうケースで使用するか

オブジェクトの一部の項目だけを基準に、連続する重複通知を省きたい場合に使用する。

## 注意点

`id` など指定していない項目が変わっても、`category` が同じなら値は流れない。離れて現れた同じ `category` は再び流れる。
