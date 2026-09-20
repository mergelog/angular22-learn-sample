# Store の selector と汎用 Observable を Signal 化

## 関数詳細

`store.selectSignal(selector)` は、NgRx Store の selector を直接 Signal として読む。

`toSignal(observable)` は、任意の Observable を購読して Signal に変換する。Store に使う場合は `store.select(selector)` を渡す。

## どういうケースで使用するか

- NgRx Store の状態を読むだけなら、短く意図が明確な `store.selectSignal()`
- API、フォーム、タイマーなど Store 以外の Observable も扱うなら `toSignal()`

## 注意点

Signal は読み取った瞬間に値を返す必要がある。一方、Observable は購読してもすぐに値を流すとは限らない。そのため `toSignal()` は、何も指定しなければ最初の値が届くまで `undefined` を返し、型も `Signal<T | undefined>` になる。

初期表示に使う値がある場合は、`toSignal(source$, { initialValue: 0 })` のように `initialValue` を指定する。この場合、Observable が最初の値を流すまでは指定した初期値を返す。

NgRx Store の `store.select()` は、購読時に現在の Store 状態を同期的に流す。そのため、このサンプルでは `requireSync: true` を指定し、次の2点を保証している。

- 購読直後に必ず値を取得する
- 戻り値の型から `undefined` を除外する

`requireSync: true` を指定した Observable が購読時に同期値を流さなかった場合、`toSignal()` はエラーになる。HTTP通信、タイマー、遅延処理などの非同期Observableには使わず、`initialValue` を指定するか `undefined` を扱う。

同じ Observable に対して `toSignal()` を何度も呼ばず、作成した Signal を再利用する。

## AIとチャット

> - API、フォーム、タイマーなど Store 以外の Observable も扱うなら `toSignal()`  
> ってのは、サンプルに表解されていますか? ot

`toSignal()` は「Observableなら何でもSignalへ変換できる」のが特徴です。例えば次のように使えます。

### APIレスポンス

```ts
private readonly http = inject(HttpClient);

readonly users = toSignal(
  this.http.get<User[]>('/api/users'),
  { initialValue: [] },
);
```

HTTPは非同期なので、レスポンスが届くまでは `initialValue` の空配列を返します。

### フォームの入力値

```ts
readonly nameControl = new FormControl('', {
  nonNullable: true,
});

readonly name = toSignal(
  this.nameControl.valueChanges,
  { initialValue: this.nameControl.value },
);
```

`valueChanges` をSignalに変換し、テンプレートや `computed()` から `name()` として読めます。

### タイマー

```ts
readonly elapsedSeconds = toSignal(
  interval(1000),
  { initialValue: 0 },
);
```

1秒ごとに更新されるObservableをSignalとして扱えます。

一方、`store.selectSignal()` が扱えるのはNgRx Storeのselectorです。

```ts
readonly count = this.store.selectSignal(selectCount);
```

整理すると次の違いです。

| API | 入力 |
|---|---|
| `store.selectSignal()` | NgRx Storeのselector |
| `toSignal()` | API、フォーム、タイマー、Storeなど任意のObservable |

そのため、Storeの状態なら `selectSignal()`、それ以外のObservableなら `toSignal()` が基本的な使い分けです。