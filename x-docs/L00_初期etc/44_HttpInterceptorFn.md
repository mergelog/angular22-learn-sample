
> ああ、mockで使ったやつだ、mockの他に利用ケースありますか

あります。むしろ `mock` は Interceptor の利用例の1つで、実務では「HTTP通信に横断的な共通処理を入れる」用途が本命です。

代表的なのはこのあたりです。

| 利用ケース     | 何をするか                                             |
| --------- | ------------------------------------------------- |
| Mock API  | 本物のAPIへ行かず、Interceptor内でダミーレスポンスを返す               |
| 認証        | 全APIに `Authorization: Bearer ...` を付ける            |
| 共通エラー処理   | `401`、`403`、`500` などをまとめて処理                       |
| ローディング表示  | 通信開始でスピナーON、終了でOFF                                |
| ログ        | URL、HTTPメソッド、レスポンス時間などを記録                         |
| 共通ヘッダー    | `Content-Language`、独自ヘッダーなどを追加                    |
| API URL補正 | `/users` → `https://api.example.com/users` のように変換 |
| Retry     | 一時的な通信失敗時だけ再試行                                    |
| キャッシュ     | 同じGETなら保存済みレスポンスを返す                               |
| 開発用通信差し替え | 特定APIだけmock、本物APIと混在させる                           |

Mockで使った場合は、たぶんこういう発想でした。

```ts
export const mockInterceptor: HttpInterceptorFn = (req, next) => {

  if (req.url.includes('/experiments')) {
    return of(
      new HttpResponse({
        status: 200,
        body: [
          { id: 1, name: 'Experiment A' }
        ]
      })
    );
  }

  return next(req);
};
```

ここでは、

```text
/experiments
    ↓
Interceptor
    ↓
本物のAPIへ行かない
    ↓
偽レスポンスを返す
```

となっています。

認証の場合は逆で、

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const newReq = req.clone({
    setHeaders: {
      Authorization: 'Bearer token123'
    }
  });

  return next(newReq);
};
```

流れは、

```text
Component
↓
HttpClient
↓
Interceptor
↓
Authorization追加
↓
本物のAPI
```

です。

特に実務でよく見るのは、かなりこの3つです。

```text
① Authorization付与
② 401などの共通エラー処理
③ Loading / ログ
```

なので、Interceptorを一言で覚えるなら、

> 「HTTP通信すべてに共通して入れたい処理を、1か所にまとめるもの」

です。

Mockで使った経験があるなら、すでにInterceptorの核心部分は触っています。Mockの場合だけ「`next(req)` せず、自分でレスポンスを返していた」という違いです。

---
--- 初期AI回答
---
---

Angular 22 の `interceptor` は、`HttpClient` の通信の途中に共通処理を差し込む仕組みです。

イメージはこれです。

```text
Component / Service
       ↓
HttpClient.get()
       ↓
Interceptor
       ↓
実際の API
       ↓
Interceptor
       ↓
Component / Service
```

つまり、各API呼び出しに毎回書きたくない処理をまとめられます。認証トークン付与、ログ出力、共通エラー処理、ローディング表示、リトライなどが代表例です。Angular公式も、Angular 22系ではクラス型より `HttpInterceptorFn` を使う functional interceptor を推奨しています。([Angular][1])

たとえば認証トークンを全通信につけるなら、基本形はこうです。

```ts
import {
  HttpInterceptorFn
} from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // ① APIへ送る直前

  const newReq = req.clone({
    setHeaders: {
      Authorization: 'Bearer abc123'
    }
  });

  // ② 次のInterceptor、または実際のHTTP通信へ流す
  return next(newReq);
};
```

重要なのが、

```ts
next(newReq)
```

です。

これは、

```text
このリクエストを次へ流してください
```

という意味です。

複数Interceptorなら、

```text
HttpClient
   ↓
authInterceptor
   ↓
loggingInterceptor
   ↓
API
```

となります。

登録は `app.config.ts` などで、

```ts
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    )
  ]
};
```

です。`withInterceptors([...])` に書いた順番でリクエスト側のInterceptorチェーンが構成されます。([Angular][1])

Interceptorは「送信前」だけではありません。レスポンスにも処理を入れられます。

```ts
import {
  HttpEventType,
  HttpInterceptorFn
} from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {

  console.log('送信:', req.url);

  return next(req).pipe(
    tap(event => {

      if (event.type === HttpEventType.Response) {
        console.log('受信:', event.status);
      }

    })
  );
};
```

流れを見るとかなり分かりやすいです。

```text
                ↓ リクエスト

HttpClient
    ↓
Interceptor
    ↓
API

    ↑
Interceptor
    ↑
HttpClient

                ↑ レスポンス
```

なので、

```ts
const interceptor: HttpInterceptorFn = (req, next) => {

  // リクエスト側
  console.log('APIへ行く前');

  return next(req).pipe(
    tap(() => {

      // レスポンス側
      console.log('APIから返ってきた後');

    })
  );
};
```

という構造になります。

実務ではだいたい次の使い分けです。

| 用途      | Interceptorでやること       |
| ------- | ---------------------- |
| 認証      | `Authorization` ヘッダー追加 |
| エラー     | 401 / 403 / 500 の共通処理  |
| ログ      | URL、処理時間、ステータス記録       |
| Loading | 通信開始でON、終了でOFF         |
| Retry   | 一時的エラーを再試行             |
| API共通設定 | 共通ヘッダーなどを追加            |

Angular 22で特に覚えるなら、

```ts
export const xxxInterceptor: HttpInterceptorFn =
  (req, next) => {

    const newReq = req.clone(...);

    return next(newReq).pipe(...);
  };
```

この形です。

そして重要な3点だけ先に固定してしまうといいです。

```text
req
＝これから送るHTTPリクエスト

next(req)
＝次のInterceptor / APIへ渡す

next(req).pipe(...)
＝返ってきたレスポンス側にも処理を入れる
```

React経験があるなら、`fetch` を呼ぶたびに共通関数で包む仕組みを、Angularの `HttpClient` 全体に正式なミドルウェアとして用意したもの、と考えるとかなり近いです。`HttpInterceptorFn` 内では `inject()` も利用できます。([Angular][2])

なお昔のAngularコードでは、

```ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(...) {
  }
}
```

というクラス型をよく見ます。Angular 22でも利用可能ですが、新規実装なら基本は `HttpInterceptorFn + withInterceptors()` を選ぶ、と覚えて問題ありません。([Angular][1])

[1]: https://angular.dev/guide/http/interceptors?utm_source=chatgpt.com "Intercepting requests and responses • Angular"
[2]: https://angular.dev/api/common/http/HttpInterceptorFn?utm_source=chatgpt.com "HttpInterceptorFn • Angular"
