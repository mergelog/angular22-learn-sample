`HttpClient` と `fromFetch()` は、どちらも HTTP 通信できますが、Angular では役割がかなり違います。

| 比較                 | `HttpClient`                 | `fromFetch()`             |
| ------------------ | ---------------------------- | ------------------------- |
| 所属                 | Angular                      | RxJS                      |
| import             | `@angular/common/http`       | `rxjs/fetch`              |
| 戻り値                | `Observable<T>`              | `Observable<Response>` など |
| JSON処理             | 基本、自動                        | `response.json()` 等が必要    |
| Angular DI         | 使う                           | 使わない                      |
| Interceptor        | ◎                            | ×                         |
| 認証ヘッダー共通付与         | ◎                            | 自前                        |
| エラー処理              | Angular向けに整備                 | Fetch API準拠               |
| HTTPテスト            | `HttpTestingController` が使える | 独自にモックが必要                 |
| unsubscribe時のキャンセル | 対応                           | 対応                        |
| `switchMap` との相性   | ◎                            | ◎                         |
| Angular業務アプリ       | **基本こちら**                    | 特殊用途                      |
| Angular外のRxJSコード   | △                            | ◎                         |

Angular公式でも `HttpClient` は型付きレスポンス、エラー処理、Interceptor、テスト機能などを提供するAngular標準のHTTP APIです。([Angular][1])

たとえば通常の API 呼び出しなら、

```ts
this.http.get<Experiment[]>('/api/experiments');
```

で、そのまま

```ts
Observable<Experiment[]>
```

として扱えます。

一方 `fromFetch()` は、

```ts
fromFetch('/api/experiments')
```

だと基本的には

```ts
Observable<Response>
```

です。

JSONまで取得するなら、たとえば、

```ts
fromFetch('/api/experiments', {
  selector: response => response.json()
});
```

のようにします。現在の `fromFetch()` には `selector` があり、Fetch のレスポンス変換までまとめることもできます。([GitHub][2])

ユースケースで分けると、こんな感じです。

| ユースケース                                | 選択                  |
| ------------------------------------- | ------------------- |
| Angularの通常のREST API                   | **`HttpClient`**    |
| JWTを全APIに自動付与                         | **`HttpClient`**    |
| 401ならログイン画面へ共通遷移                      | **`HttpClient`**    |
| 全通信のログを取りたい                           | **`HttpClient`**    |
| APIのモックテストを簡単に書きたい                    | **`HttpClient`**    |
| Angularとは無関係なRxJSライブラリを書く             | **`fromFetch()`**   |
| RxJSだけで完結させたい                         | **`fromFetch()`**   |
| Fetch APIの `RequestInit` を直接使いたい      | `fromFetch()`       |
| `fetch()` を `switchMap` 内でキャンセル可能にしたい | `fromFetch()`       |
| Angularサービス内の普通の通信                    | **ほぼ `HttpClient`** |

特に違いが出るのがInterceptorです。

たとえばAngularなら、

```ts
http.get('/api/experiments');
http.get('/api/models');
http.post('/api/tasks', body);
```

これら全部にInterceptorを使って、

```text
Authorization: Bearer xxxxx
```

を自動で付けたり、

```text
401 → 認証処理
500 → 共通エラー処理
```

のようなことができます。Angular公式も、認証、リトライ、キャッシュ、ログ、ローディング表示などをInterceptorの代表的用途として挙げています。([Angular][3])

`fromFetch()` では、このAngularのInterceptorチェーンを通りません。

なので、

```ts
fromFetch('/api/experiments')
```

と書いた瞬間、

> この通信だけAngularのHTTP共通処理から外れる

可能性があります。

ClearMLのような大きなAngularアプリでは、ここがかなり重要です。

逆に `fromFetch()` の強みは、

```ts
search$.pipe(
  switchMap(keyword =>
    fromFetch(`/api/search?q=${keyword}`)
  )
)
```

のように、RxJSだけで自然に通信まで完結できることです。

普通の

```ts
switchMap(() => fetch(...))
```

では `fetch()` がPromiseなので、unsubscribeしてもそのPromise自体はキャンセルされません。一方 `fromFetch()` はunsubscribeに連動してFetchをabortする仕組みを持っています。([GitHub][4])

ただしAngularでは `HttpClient` 自体がObservableなので、

```ts
search$.pipe(
  switchMap(keyword =>
    this.http.get(`/api/search?q=${keyword}`)
  )
)
```

で同じようなキャンセル設計ができます。

なので学習用に一言でまとめるなら、

> **`HttpClient` = Angular向けHTTP通信の完成版**
> **`fromFetch()` = Fetch APIをRxJSのObservableとして扱う薄いラッパー**

くらいの理解がちょうどいいです。

ClearMLのAngularコードを読む前提なら、`fromFetch()` は「見かけたら意味が分かる」レベルで十分で、`HttpClient` の方を深く理解する優先度がかなり高いです。

[1]: https://angular.dev/guide/http?utm_source=chatgpt.com "HTTP Client • Overview • Angular"
[2]: https://github.com/ReactiveX/rxjs/discussions/7584?utm_source=chatgpt.com "Add server-sent event (for client-side) supports · ReactiveX rxjs · Discussion #7584 · GitHub"
[3]: https://angular.dev/guide/http/interceptors?utm_source=chatgpt.com "Intercepting requests and responses • Angular"
[4]: https://github.com/ReactiveX/rxjs/discussions/6975?utm_source=chatgpt.com "How does switchMap cancel HTTP requests · ReactiveX rxjs · Discussion #6975 · GitHub"
