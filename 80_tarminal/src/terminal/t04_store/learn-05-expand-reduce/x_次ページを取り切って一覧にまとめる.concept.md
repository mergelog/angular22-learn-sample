# 次ページを取り切って一覧にまとめる

| 51 | `[ ]` | `expand()` + `reduce()` | RxJS **[pipe]** | 次ページを自己再帰で<br>取り切り、最後に<br>1 本へ畳む | **一覧系 Effect の中核**。<br>`expand` が終了条件で<br>`EMPTY` を返すまで再帰する | 6 / 6ファイル<br>**辞書: 未掲載**<br>(QA 優先度2) |

## 関数詳細

`expand` は各ページから次ページの Observable を作り、再帰的に取得する。
`nextPage` が `null` なら `EMPTY` を返して終了する。`reduce` は完了まで各ページの `items` を蓄積し、最後に一覧を1回だけ出力する。

## どういうケースで使用するか

ページ分割された API の全件を取得し、一覧系 Effect で1つの配列として扱う場合。

## 注意点

終了条件を誤ると取得が続く。途中でエラーになると `reduce` は結果を出力しない。

---
Ai会話

はい、**次ページの取得処理は繰り返されます**。ただし、`pipe` 全体をコピーして実行しているわけではありません。

`expand` はページを受け取るたびに、指定した関数を呼びます。

1. `fetchPage(1)` がページ1を出す
2. `expand` が `fetchPage(2)` を呼び、その Observable を購読する
3. ページ2が出ると、同じ関数で `fetchPage(3)` を呼ぶ
4. ページ3の `nextPage` は `null` なので `EMPTY` を返し、終了する

各ページは後続の `reduce` にも流れます。`reduce` は全ページの完了を待って、まとめた配列を1回だけ出力します。

モヤッとする点は、おそらく **`fetchPage(2)` の結果が、どうしてまた `expand` に戻るのか** だと思います。

`expand` は、ざっくり言うと次の処理を内部に持っています。

```ts
function 受け取る(page: Page) {
  下流へ流す(page);                 // reduce に渡す

  const next$ = 次を作る関数(page);  // 今回は fetchPage(page.nextPage)
  next$.subscribe(受け取る);        // 次の結果も、同じ「受け取る」に渡す
}
```

ポイントは最後の行です。`fetchPage(2)` が返したページ2は、`reduce` に流れるだけでなく、**再び `expand` 自身の処理対象になります**。

```text
ページ1 → expand → reduce
             └ fetchPage(2) → ページ2 → expand → reduce
                                           └ fetchPage(3) → ページ3 → expand → reduce
                                                                         └ EMPTY（次なし）
```

`pipe` をコピーしているのではなく、`expand` が「次の Observable を購読し、その値にも同じ処理を適用する」仕組みです。`EMPTY` は値を出さずに完了するので、そこで次ページの連鎖が止まります。連鎖が全部完了してから、`reduce` が集めた一覧を出します。