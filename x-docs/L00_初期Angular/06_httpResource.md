`httpResource()` は、ひと言でいうと、

**「HTTP 通信専用の `resource()`」**

です。

`HttpClient` を内部で使いながら、レスポンス・loading・error・status などを Signal として扱えます。Angular 22 では stable です。([Angular][1])

一番単純な形はこれです。

```ts
readonly userId = signal(1);

readonly userResource = httpResource<User>(
  () => `/api/users/${this.userId()}`
);
```

見る順番は、

```text
userId
  ↓
URLを作る
  ↓
httpResource
  ↓
HTTP GET
  ↓
value / isLoading / error
```

です。

`userId()` が変わると、

```ts
this.userId.set(2);
```

自動で、

```text
/api/users/1
   ↓
/api/users/2
```

へ再リクエストします。

しかも前のHTTP通信がまだ終わっていれば、古いリクエストをキャンセルして新しいリクエストを発行します。([Angular][2])

戻り値は先ほどの `resource()` にかなり似ています。

```ts
readonly userResource = httpResource<User>(...);
```

型は、`defaultValue` なしなら概念的に、

```ts
HttpResourceRef<User | undefined>
```

です。([Angular][1])

したがって、

```ts
userResource.value()
```

は、

```ts
User | undefined
```

です。

さらに、

```ts
userResource.isLoading()
userResource.error()
userResource.status()
```

も使えます。

ここまでは `resource()` とほぼ同じです。

ただし `httpResource()` はHTTP専用なので、HTTP固有の情報も持っています。

```ts
userResource.statusCode()
userResource.headers()
userResource.progress()
```

それぞれ、

```text
statusCode() → HTTPステータスコード
headers()    → レスポンスヘッダー
progress()   → 通信進捗
```

です。([Angular][3])

例えばテンプレートでは、

```html
@if (userResource.isLoading()) {
  <p>読み込み中...</p>
}

@if (userResource.hasValue()) {
  <p>{{ userResource.value().name }}</p>
}

@if (userResource.error()) {
  <p>取得失敗</p>
}
```

という使い方になります。

重要なのは `resource()` や `rxResource()` との違いです。

| API              | 中で実行するもの          | 主な用途          |
| ---------------- | ----------------- | ------------- |
| `resource()`     | Promise / async処理 | 汎用非同期処理       |
| `rxResource()`   | Observable        | RxJSベースの非同期処理 |
| `httpResource()` | HTTP              | API取得         |

たとえば同じユーザー取得でも、

`resource()` なら、

```ts
readonly userResource = resource({
  params: () => this.userId(),

  loader: async ({ params: id }) => {
    const response = await fetch(`/api/users/${id}`);
    return response.json() as Promise<User>;
  },
});
```

`rxResource()` なら、

```ts
readonly userResource = rxResource({
  params: () => this.userId(),

  stream: ({ params: id }) =>
    this.userService.getUser(id),
});
```

`httpResource()` なら、

```ts
readonly userResource = httpResource<User>(
  () => `/api/users/${this.userId()}`
);
```

となります。

なので HTTP GET だけなら、かなり短くなります。

しかも `httpResource()` は単なる `fetch()` のラッパーではありません。

内部では Angular の `HttpClient` を使うので、

```text
Interceptor
XSRF
HttpClient Testing
Angular HTTP設定
```

などの仕組みをそのまま利用できます。([Angular][1])

以前やったInterceptorもここにつながります。

たとえば、

```ts
readonly users = httpResource<User[]>(
  () => '/api/users'
);
```

と書いても、

```text
httpResource
   ↓
HttpClient
   ↓
Interceptor
   ↓
サーバー
```

というAngularのHTTP経路を通ります。

もう少し複雑なHTTPリクエストも書けます。

```ts
readonly users = httpResource<User[]>(() => ({
  url: '/api/users',
  method: 'GET',

  params: {
    page: this.page(),
    keyword: this.keyword(),
  },

  headers: {
    'X-Special': 'true',
  },
}));
```

この場合、

```ts
this.page.set(2);
```

や、

```ts
this.keyword.set('angular');
```

によってrequestオブジェクトが変わるので、再取得されます。`url`、`method`、`body`、`params`、`headers`、`timeout` などを指定できます。([Angular][4])

そして `httpResource()` には、レスポンス形式ごとのAPIもあります。

```ts
httpResource(...)
```

はJSON。

```ts
httpResource.text(...)
```

は文字列。

```ts
httpResource.blob(...)
```

はBlob。

```ts
httpResource.arrayBuffer(...)
```

はArrayBufferです。([Angular][1])

たとえば、

```ts
readonly csv = httpResource.text(
  () => '/api/export.csv'
);
```

なら、

```ts
csv.value()
```

は、

```ts
string | undefined
```

になります。

もう1つ、かなり重要な違いがあります。

普通の `HttpClient` は、

```ts
this.http.get<User>('/api/user')
```

と書いただけでは通信しません。

戻り値はObservableなので、

```ts
.subscribe()
```

されたときにHTTP通信が始まります。

対して、

```ts
readonly user =
  httpResource<User>(() => '/api/user');
```

は **eager** です。

つまり `httpResource()` が作られると、購読を書かなくてもHTTP取得が開始されます。Angular公式もこの点を `HttpClient` との違いとして明示しています。([Angular][2])

ここは覚えておいた方がいいです。

```text
HttpClient
Observable
↓
subscribeされたら通信

httpResource
Signalベース
↓
自動で通信
```

そして注意点があります。

`httpResource()` は基本的に、

```text
GET
データ取得
```

向けです。

Angular公式も `POST` や `PUT` などのmutationには `httpResource()` を避け、通常の `HttpClient` を使うことを推奨しています。([Angular][2])

なので実務では、

```text
一覧取得
詳細取得
検索結果取得
マスタ取得
```

なら、

```ts
httpResource()
```

が候補。

一方、

```text
登録
更新
削除
保存
```

なら、

```ts
HttpClient
```

を使う、という切り分けが分かりやすいです。

今の学習の流れで一番重要なまとめはこれです。

```text
resource()
非同期処理をSignal化する汎用品

rxResource()
Observableを使うresource

httpResource()
HttpClientを使うHTTP専用resource
```

そしてClearMLのような既存のAngular + NgRxアプリを読む場合は、**既存ServiceがObservableを返す設計なら `rxResource()`、新しく単純なGET主体のSignal設計を書くなら `httpResource()` が候補**、くらいの認識から入ると整理しやすいです。

[1]: https://angular.dev/api/common/http/httpResource?utm_source=chatgpt.com "httpResource • Angular"
[2]: https://angular.dev/guide/http/http-resource?utm_source=chatgpt.com "Reactive data fetching with httpResource • Angular"
[3]: https://angular.dev/api/common/http/HttpResourceRef?utm_source=chatgpt.com "HttpResourceRef • Angular"
[4]: https://angular.dev/api/common/http/HttpResourceRequest?utm_source=chatgpt.com "HttpResourceRequest • Angular"
