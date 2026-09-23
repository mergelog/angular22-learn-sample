`resource()` は、

**「Signal の値を条件にして非同期処理を実行し、その結果・loading・error を Signal としてまとめて管理するもの」**

です。Angular 22では stable です。([Angular][1])

たとえば、

```ts
readonly userId = signal(1);

readonly userResource = resource({
  params: () => this.userId(),

  loader: async ({ params: userId }) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
});
```

見る順番はこの3つです。

```ts
userId
  ↓
params
  ↓
loader
```

まず、

```ts
readonly userId = signal(1);
```

これは「今、誰を取得するか」。

次に、

```ts
params: () => this.userId(),
```

ここで `userId()` を監視します。

最後に、

```ts
loader: async ({ params: userId }) => {
  ...
}
```

`params` が変わるたびに、この非同期処理が実行されます。公式にも、`params` が再計算されて値が変わると `loader` が再実行される、とされています。([Angular][2])

つまり、

```ts
this.userId.set(2);
```

すると、

```text
userId = 2
   ↓
params が変化
   ↓
loader 再実行
   ↓
ユーザー2を取得
```

となります。

取得結果はこう読めます。

```ts
userResource.value()
userResource.isLoading()
userResource.error()
userResource.status()
```

これらは Signal です。([Angular][3])

テンプレートなら、

```html
@if (userResource.isLoading()) {
  <p>読込中...</p>
}

@if (userResource.hasValue()) {
  <p>{{ userResource.value().name }}</p>
}

@if (userResource.error()) {
  <p>エラー</p>
}
```

という使い方になります。

かなり雑に言えば、

```text
computed()
同期的に値を計算する

resource()
非同期で値を取りに行く
```

という対比です。

例えば、

```ts
readonly fullName = computed(() => {
  return this.firstName() + this.lastName();
});
```

これはその場で計算できます。

一方、

```ts
readonly userResource = resource({
  params: () => this.userId(),

  loader: async ({ params: id }) => {
    return await fetchUser(id);
  },
});
```

これはAPIなどへ行って、結果が返ってくるまで時間がかかる。

だから `resource()` が、

```text
取得開始
↓
loading
↓
成功 → value
または
失敗 → error
```

まで管理してくれます。

そして、さっきの `rxResource()` との関係は非常に単純です。

| API              | 非同期処理側                        |
| ---------------- | ----------------------------- |
| `resource()`     | Promise / `async-await`       |
| `rxResource()`   | Observable                    |
| `httpResource()` | Angular `HttpClient` ベースのHTTP |

`resource()` は典型的には、

```ts
resource({
  params: () => this.userId(),

  loader: async ({ params: id }) => {
    return await fetchUser(id);
  },
});
```

`rxResource()` は、

```ts
rxResource({
  params: () => this.userId(),

  stream: ({ params: id }) => {
    return this.userService.getUser(id);
  },
});
```

です。

なので覚え方は、

```text
resource
  params
  loader
  Promise

rxResource
  params
  stream
  Observable
```

これで十分です。

さらに Angular 22 では `resource()` は主に**読み取り処理**向けです。`params` が途中で変わると進行中のloadをキャンセルできる仕組みになっているため、更新・登録・削除のような mutation 用途には基本的に向いていません。([Angular][1])

今の学習順なら、

**`resource()` → `rxResource()` → `httpResource()`**

の順に並べて理解すると、かなり整理しやすいです。

[1]: https://angular.dev/api/core/resource?utm_source=chatgpt.com "resource • Angular"
[2]: https://angular.dev/guide/signals/resource?utm_source=chatgpt.com "Async reactivity with resources • Angular"
[3]: https://angular.dev/api/core/Resource?utm_source=chatgpt.com "Resource • Angular"
