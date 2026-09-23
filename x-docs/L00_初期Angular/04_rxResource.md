`rxResource()` は、ひと言でいうと、

**「Observable を返す非同期処理を、Signal として扱いやすくする仕組み」**

です。

Angular 22では `stable` になっています。`resource()` の RxJS版と考えるとかなり近いです。([Angular][1])

たとえば、既存のServiceがこうだとします。

```ts
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  getUser(id: number) {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

`HttpClient` なので戻り値は `Observable<User>` です。

これを `rxResource()` につなげると、

```ts
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user',
  template: `
    @if (userResource.isLoading()) {
      <p>読み込み中...</p>
    }

    @if (userResource.hasValue()) {
      <p>{{ userResource.value().name }}</p>
    }

    @if (userResource.error()) {
      <p>エラー</p>
    }
  `,
})
export class UserComponent {
  private readonly userService = inject(UserService);

  readonly userId = signal(1);

  readonly userResource = rxResource({
    params: () => this.userId(),

    stream: ({ params: userId }) =>
      this.userService.getUser(userId),
  });
}
```

見る順番はこうです。

```ts
readonly userId = signal(1);
```

これが検索条件。

↓

```ts
params: () => this.userId(),
```

`userId()` が変わったら、`rxResource` がそれを検知します。

↓

```ts
stream: ({ params: userId }) =>
  this.userService.getUser(userId),
```

新しい `userId` でObservableを作り直します。

↓

結果は、

```ts
userResource.value()
userResource.isLoading()
userResource.error()
userResource.status()
```

という **Signal API** で読めます。`Resource` は値・loading・error・statusをSignalとして公開します。([Angular][2])

つまり流れとしては、

```text
Signal
  userId
    ↓
params
    ↓
rxResource
    ↓
Observable
  HttpClient
    ↓
Resource
    ↓
value()
isLoading()
error()
status()
```

です。

ここが `toSignal()` との大きな違いです。

|           | `toSignal()`          | `rxResource()` |
| --------- | --------------------- | -------------- |
| 主目的       | Observable → Signal変換 | 非同期データ取得を管理    |
| `value()` | ○                     | ○              |
| loading管理 | 自分で作る                 | ○              |
| error管理   | 自分で考える                | ○              |
| 条件変更で再取得  | 自分で組む                 | `params`       |
| API取得用途   | 使える                   | **かなり向いている**   |

例えば `toSignal()` なら、

```ts
readonly user = toSignal(
  this.userService.getUser(1)
);
```

単純な変換です。

一方 `rxResource()` は、

```ts
readonly userResource = rxResource({
  params: () => this.userId(),

  stream: ({ params: id }) =>
    this.userService.getUser(id),
});
```

なので、

**「IDが変わった → APIを取り直す → loading → 成功/失敗 → 結果をSignalで表示」**

までをひとまとまりで管理できます。公式にも、`params` の値が変わるたび `stream` が再実行される仕組みとして説明されています。([Angular][3])

そして、ここはかなり重要です。

```ts
params: () => this.userId()
```

は `computed()` に近い「依存関係の監視」です。

なので、

```ts
this.userId.set(2);
```

すると、自分で

```ts
subscribe()
```

したり、

```ts
effect()
```

を書いたりしなくても、再取得されます。

したがって以前やった `effect()` の話ともつながります。

```ts
effect(() => {
  const id = this.userId();

  this.userService.getUser(id).subscribe(...);
});
```

のようなコードをAPI取得目的で書きたくなる場面がありますが、こういう用途なら `rxResource()` の方が設計意図に合います。

```ts
readonly userResource = rxResource({
  params: () => this.userId(),

  stream: ({ params: id }) =>
    this.userService.getUser(id),
});
```

つまり、

```text
effect()
Signalを監視して「副作用」を起こす

rxResource()
Signalを条件として「非同期データ」を取得・管理する
```

という違いです。

さらに `resource()` との違いはかなり単純です。

```ts
resource({
  params: () => this.userId(),

  loader: async ({ params: id }) => {
    return await fetchUser(id);
  },
});
```

に対して、

```ts
rxResource({
  params: () => this.userId(),

  stream: ({ params: id }) => {
    return this.userService.getUser(id);
  },
});
```

です。

つまり、

```text
resource
  Promise / async系
  loader

rxResource
  Observable系
  stream
```

と覚えて大丈夫です。Angular公式も `rxResource` を「`resource` と同様だが、RxJSベースのloaderとしてObservableを使うもの」と定義しています。([Angular][1])

ClearMLのようなAngular + RxJS主体の既存アプリなら、特に重要なのはここです。

> **ServiceがObservableを返していて、その取得結果をSignalベースの画面で扱いたい**

このとき `rxResource()` がかなり自然です。

なお `rxResource` の `stream` が返すObservableは、完了する前に**値またはエラーを最低1回は出す必要があります**。たとえば `catchError(() => EMPTY)` で何もemitせず完了すると `NG0991` になります。([Angular][3])

次に学ぶなら、`rxResource()` は **`params → stream → value/isLoading/error` の3段階**だけで実際に動くサンプルを作ると、一気に腑に落ちると思います。

[1]: https://angular.dev/api/core/rxjs-interop/rxResource?utm_source=chatgpt.com "rxResource • Angular"
[2]: https://angular.dev/api/core/Resource?utm_source=chatgpt.com "Resource • Angular"
[3]: https://angular.dev/api/core/rxjs-interop/RxResourceOptions?utm_source=chatgpt.com "RxResourceOptions • Angular"
