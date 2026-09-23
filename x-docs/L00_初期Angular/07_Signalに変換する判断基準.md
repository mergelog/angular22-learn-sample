そこは実務だとかなり悩むところです。結論としては、**「Signalへ移行すること」自体を目的にしない**ほうが安全です。

Angular自身も、SignalsとRxJSを相互運用するAPIを用意していて、既存コードを段階的に移行できる前提になっています。`toSignal()` / `toObservable()` / `rxResource()` がまさにその橋渡しです。([Angular][1])

判断軸はかなりシンプルで、

| 状況                                           | 私なら                                   |
| -------------------------------------------- | ------------------------------------- |
| コンポーネント内のローカル状態                              | `signal()` に寄せる                       |
| Signalから同期的に派生する値                            | `computed()`                          |
| API GETの結果を画面で保持したい                          | `httpResource()` / `rxResource()` を検討 |
| 既存ServiceがObservableを返していて安定稼働中              | 無理に変えない                               |
| 複雑なイベントストリーム処理                               | RxJSのまま                               |
| debounce / retry / concatMap / switchMap等が重要 | RxJSのまま                               |
| NgRx Store中心のFeature                         | 無理にSignal化しない                         |
| テンプレート表示だけSignalにしたい                         | 境界で `toSignal()`                      |

特に重要なのは、

> **ObservableだからSignalに変える、ではない**

ということです。

例えば既存コードが、

```ts
readonly users$ = this.store.select(selectUsers);
```

で問題なく、

```html
@for (user of users$ | async; track user.id) {
```

まで完成しているなら、

```ts
readonly users = toSignal(
  this.store.select(selectUsers)
);
```

に変えても、得られるものが小さいケースがあります。

これはまさに、

> 「わざわざSignalにしなくても……」

で正しい判断です。

逆に、新しく画面を作って、

```ts
readonly selectedId = signal<number | undefined>(undefined);

readonly selectedUser = computed(() =>
  this.users().find(x => x.id === this.selectedId())
);
```

みたいにSignal中心で組み始めたところへ、

```ts
users$: Observable<User[]>
```

だけ混ざっているなら、

```ts
readonly users = toSignal(this.users$, {
  initialValue: [],
});
```

と境界でSignal化する価値は高いです。

つまり私は、移行PJなら「どちらを使うか」ではなく、

```text
この範囲の主言語は
Signalなのか
Observableなのか
```

で判断します。

ここが一番重要です。

たとえば新規コンポーネントなら、

```text
Component内部
    ↓
Signalを主言語にする

API / NgRx / RxJS処理
    ↓
Observableのまま

境界
    ↓
toSignal / rxResource
```

という設計はかなり綺麗です。

具体的には、

```ts
// Service側
getUsers(): Observable<User[]> {
  return this.http.get<User[]>('/api/users');
}
```

ServiceはObservableのまま。

コンポーネント側で、

```ts
readonly users = rxResource({
  stream: () => this.userService.getUsers(),
});
```

とする。

つまり、

```text
Service
Observable世界

      ↓ 境界

Component
Signal世界
```

にします。

逆に一番避けたいのは、

```text
Observable
↓
Signal
↓
Observable
↓
Signal
↓
Observable
```

と何度も往復することです。

例えば、

```ts
const users = toSignal(users$);

const filtered$ = toObservable(users)
  .pipe(...);

const filtered = toSignal(filtered$);
```

みたいになってきたら、

「これ、RxJSのままでよくない？」

と考えたほうがいいです。

Angular公式もSignalsとRxJSの相互運用を明確に提供していますが、`toSignal()` はObservableごとに何度も呼ぶのではなく、作ったSignalを再利用するよう注意しています。([Angular][1])

もう一つ実務で使いやすい基準があります。

**「値なのか、時間軸のあるイベントなのか」**

です。

```text
現在の選択値
現在のユーザー
現在の検索条件
現在の一覧
現在のloading状態

→ Signal向き
```

対して、

```text
クリックの連続
検索入力のdebounce
再試行
ポーリング
順番制御
キャンセル
複数非同期イベントの合成

→ RxJS向き
```

です。

例えば、

```ts
searchText
```

という「現在値」だけなら、

```ts
readonly searchText = signal('');
```

で十分。

しかし、

```text
入力
↓
300ms debounce
↓
重複排除
↓
前のHTTPキャンセル
↓
最新検索
```

なら、

```ts
debounceTime()
distinctUntilChanged()
switchMap()
```

のRxJSのほうが自然なケースは普通にあります。

なのでSignal移行PJなら、私はこんなルールにします。

> **状態はSignal寄り、イベントストリームはRxJS寄り。既存の安定コードは理由なく書き換えない。新規コードからSignal境界を増やしていく。**

AngularもSignalsをローカル状態管理の基本APIとして位置付けつつ、RxJSとのInteropを正式に提供しています。([Angular][2])

そして今のClearML系のような、既にRxJS/NgRxがかなり入っているPJなら、たぶん現実的なのはこれです。

```text
既存NgRx
そのまま

既存RxJS Service
そのまま

新規Componentのローカル状態
Signal

新規の派生状態
computed

既存Observableを新規Signal画面で使う
toSignal / rxResource

単純GETの新規実装
httpResourceを検討
```

このくらいの「混在を許す移行」のほうが、全面Signal化よりかなり現実的です。

そしてコードレビュー時には、

> 「これSignalにできますか？」

より、

> **「これをSignalにすると、状態の読み方が単純になるか？」**

で考えると判断しやすいです。

単純にならないなら、変えない。

この基準はかなり使えます。

[1]: https://angular.dev/ecosystem/rxjs-interop?utm_source=chatgpt.com "Signals interop • Angular"
[2]: https://angular.dev/essentials/signals?utm_source=chatgpt.com "Reactivity with signals • Angular"
