
> 使い所のケースが想像つかないな

---

`first()` 単体は、Angular実務だと「これ絶対必要」という場面は意外と少ないです。むしろ `first(predicate)` のほうが使い所をイメージしやすいです。

たとえば NgRx で、ロード完了を待って「最初にロード済みになった瞬間だけ処理したい」場合です。

```ts
this.store.select(selectUserState).pipe(
  first(state => state.loaded)
).subscribe(state => {
  // 最初に loaded === true になった瞬間だけ実行
});
```

流れとしてはこうです。

```text
{ loaded: false }
        ↓ 無視

{ loaded: false }
        ↓ 無視

{ loaded: true }
        ↓
ここで first() が拾う
        ↓
購読終了

{ loaded: true }
        ↓
もう見ない
```

これはかなり `first()` らしい使い方です。

「条件を満たす最初の1回だけ欲しい」という用途ですね。

たとえば ClearML系の画面なら、

```ts
this.store.select(selectExperiment).pipe(
  first(experiment => experiment != null)
)
```

とすると、

> Experiment がまだStoreに無い間は待つ
> 最初にExperimentが入った瞬間だけ受け取る
> その後の更新は不要

という意味になります。

これを `take(1)` にすると全然意味が違います。

```ts
this.store.select(selectExperiment).pipe(
  take(1)
)
```

もし最初が

```ts
undefined
```

なら、それを取って即終了してしまいます。

つまり、

```text
Store

undefined
   ↓
Experiment A
   ↓
Experiment B
```

なら、

```ts
take(1)
```

は

```text
undefined を取って終了
```

ですが、

```ts
first(x => x != null)
```

は

```text
undefined → 無視
Experiment A → 取得して終了
Experiment B → 見ない
```

です。

ここが一番実務的な使い所です。

逆に、単なる

```ts
first()
```

は、

```ts
take(1)
```

とかなり似ているので、Angularでは「値が無かったらエラーにしたい」という明確な意図がなければ `take(1)` のほうが読みやすいことも多いです。

なので覚え方としては、

```text
take(1)
最初に来たものを1個取る

first()
最初の1個が存在する前提で取る

first(条件)
条件を満たした最初の1個まで待つ
```

です。

特に実務で見るなら、`first()` の本領は

```ts
first(x => 条件)
```

の方だと思っておくとかなり腑に落ちます。

--- 初期会話

そうです。かなり近いですが、`destroy` は少し注意が必要です。

`first()` がエラーになる条件は、

> 「値が1件も来ないまま、`first()` から見て Observable が `complete` した」

ときです。

なので `takeUntilDestroyed()` との順番で挙動が変わります。

```ts
source$.pipe(
  first(),
  takeUntilDestroyed()
)
```

この場合、値が来る前にコンポーネントが destroy されたら、`takeUntilDestroyed()` が購読を解除します。

```text
source$ → first() → takeUntilDestroyed()
             ↑
       まだ値を待っている

destroy
  ↓
購読解除
```

この場合、`first()` に「completeしたよ」という通知が来るわけではなく、単に unsubscribe されます。

なので通常、`first()` の `EmptyError` は出ません。

一方、順番が逆だと重要です。

```ts
source$.pipe(
  takeUntilDestroyed(),
  first()
)
```

値が来る前に destroy されると、

```text
source$
   ↓
takeUntilDestroyed()
   ↓ destroyされたので complete
first()
   ↓
「1個も来てないのにcompleteした！」
   ↓
EmptyError
```

となり得ます。

つまり今回のポイントは、

```text
unsubscribe ≠ complete
```

です。

`first()` が怒るのは「購読解除されたとき」ではなく、

> `first()` が値を受け取る前に `complete` を受け取ったとき

です。

Angularで見るなら、この2つは意味が違います。

```ts
source$.pipe(
  first(),
  takeUntilDestroyed()
)
```

→ destroyされたら途中で購読をやめるだけ。

```ts
source$.pipe(
  takeUntilDestroyed(),
  first()
)
```

→ destroyが `first()` から見ると「値なしで終了」になるので、`EmptyError` の可能性あり。

この違いは `first()` を理解するうえでかなり重要です。
