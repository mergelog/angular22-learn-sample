`catchError` は RxJS で、Observable の途中で発生したエラーを捕まえて、別の Observable に差し替えるためのオペレータです。

一番重要なのはこれです。

```ts
this.api.getUsers().pipe(
  catchError(error => {
    console.error(error);

    return of([]);
  })
);
```

`getUsers()` が失敗したとき、本来なら Observable はそこでエラー終了します。

しかし `catchError` があると、

```text
API成功
  ↓
ユーザー一覧を流す

API失敗
  ↓
catchError
  ↓
of([]) に差し替える
  ↓
空配列を流して正常終了
```

という動きになります。

つまり感覚的には、

```ts
try {
  // 処理
} catch (error) {
  // エラー時の処理
}
```

の RxJS 版に近いです。

ただし重要な違いがあります。

`catchError` の中では、基本的に「代わりに流す Observable」を返します。

たとえば、

```ts
catchError(error => {
  return of([]);
})
```

なら、

```text
失敗したObservable
        ↓
     catchError
        ↓
    of([]) に交換
        ↓
      [] が流れる
```

です。

よく使う戻り値はこの3つです。

```ts
// ① 代替値を返す
catchError(error => {
  return of([]);
})
```

```ts
// ② 何も流さず終了
catchError(error => {
  return EMPTY;
})
```

```ts
// ③ エラーをもう一度投げる
catchError(error => {
  console.error(error);

  return throwError(() => error);
})
```

それぞれ意味が違います。

```text
of([])
→ エラーを「空配列」という正常値に変換

EMPTY
→ エラーを飲み込んで、そのObservableを終了

throwError(...)
→ ここでは処理するが、エラー自体は上位へ渡す
```

実務で特に重要なのが、`catchError` をどこに置くかです。

たとえば検索です。

```ts
searchText$.pipe(
  switchMap(keyword =>
    this.api.search(keyword).pipe(
      catchError(error => {
        console.error(error);
        return of([]);
      })
    )
  )
);
```

この場合、

```text
検索A
 ↓
APIエラー
 ↓
catchError
 ↓
[]

検索B
 ↓
またAPIを呼べる
```

となります。

つまり「その1回の API 呼び出しだけ失敗扱い」にできます。

一方、こう書くと意味が変わります。

```ts
searchText$.pipe(
  switchMap(keyword =>
    this.api.search(keyword)
  ),

  catchError(error => {
    console.error(error);
    return of([]);
  })
);
```

この場合は `switchMap` の外側全体を `catchError` しています。

そのため、

```text
searchText$
    ↓
switchMap
    ↓
APIエラー
    ↓
catchError
    ↓
of([])
    ↓
全体終了
```

となり、その後 `searchText$` に新しい値が来ても検索処理が続かないことがあります。

ここは実務でかなり重要です。

なので API 単位で失敗を処理したいなら、

```ts
switchMap(() =>
  apiCall().pipe(
    catchError(...)
  )
)
```

という形が非常によく出てきます。

NgRx Effects でも同じです。

```ts
loadUsers$ = createEffect(() =>
  this.actions$.pipe(

    ofType(UserActions.loadUsers),

    switchMap(() =>
      this.api.getUsers().pipe(

        map(users =>
          UserActions.loadUsersSuccess({ users })
        ),

        catchError(error =>
          of(
            UserActions.loadUsersFailure({ error })
          )
        )

      )
    )

  )
);
```

流れは、

```text
loadUsers Action
      ↓
switchMap
      ↓
API
   ↓       ↓
成功      失敗
 ↓         ↓
map     catchError
 ↓         ↓
Success   Failure
 Action    Action
```

です。

この NgRx の形はかなり重要です。`catchError` が `switchMap` の内側にあるので、1回 API が失敗しても Effect 自体は死なず、次の `loadUsers` Action を受け取れます。

まずは `catchError` を、

> 「エラーを捕まえる」だけではなく、
> 「エラーになった Observable を別の Observable に交換する」

と理解すると、RxJS のコードがかなり読みやすくなります。

特に実務では、

```ts
catchError(() => of(...))
```

と

```ts
catchError(() => EMPTY)
```

と

```ts
catchError(error => throwError(() => error))
```

の違い、それから **`switchMap` の内側か外側か**、この4点を押さえておけばかなり対応できます。
