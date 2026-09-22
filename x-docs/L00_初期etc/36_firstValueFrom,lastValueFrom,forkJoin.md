
---
--- 以下重要。
---
---


`lastValueFrom()` には重要な弱点があります。
一番大きいのは、**Observableの世界からPromiseの世界に出てしまう**ことです。

見た目だけなら `await lastValueFrom(...)` の方がかなり読みやすいです。実際、**用途によってはこっちを使った方がいい**です。

ただし、Angular/RxJSでは「短いから常にこちら」が正解ではありません。

```ts
const result = await lastValueFrom(
  forkJoin([experimentsMetrics, modelsMetrics])
);
```

これが向いているのは、特にこういう処理です。

```ts
async load() {
  try {
    const [experimentMetrics, modelMetrics] = await lastValueFrom(
      forkJoin([
        this.api.getExperimentMetrics(),
        this.api.getModelMetrics(),
      ])
    );

    this.useMetrics([experimentMetrics, modelMetrics]);
  } catch (error) {
    this.handleError(error);
  }
}
```

これはかなり自然です。

「2つの通信が終わるまで待つ → 結果を使う」という**手続き的な処理**なので、

```text
通信する
↓
待つ
↓
結果を使う
```

というコードの見た目と実際の処理順が一致します。

一方、RxJSのまま書くと、

```ts
forkJoin([
  this.api.getExperimentMetrics(),
  this.api.getModelMetrics(),
]).subscribe({
  next: ([experimentMetrics, modelMetrics]) => {
    this.useMetrics([experimentMetrics, modelMetrics]);
  },
  error: (error) => {
    this.handleError(error);
  },
});
```

少し大げさに見えます。

ただ、`lastValueFrom()` には重要な弱点があります。

一番大きいのは、**Observableの世界からPromiseの世界に出てしまう**ことです。

例えば後から、

```ts
search$
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(keyword => this.api.search(keyword)),
    takeUntilDestroyed()
  )
```

みたいな処理に発展した場合、RxJSのままの方が圧倒的に扱いやすいです。

特に、

```ts
switchMap()
takeUntilDestroyed()
catchError()
retry()
debounceTime()
```

などを使いたい処理なら、`lastValueFrom()` に変換しない方がいいです。

さらに重要なのがキャンセルです。

```ts
const result = await lastValueFrom(observable$);
```

とすると、普通のPromiseとして待つため、

```text
「もう画面閉じたから購読解除」
```

というObservableらしい制御がやりにくくなります。

`subscribe()` + `takeUntilDestroyed()` なら、

```ts
forkJoin([...])
  .pipe(
    takeUntilDestroyed()
  )
  .subscribe(...);
```

とAngularコンポーネントの破棄に連動できます。

そしてもう1つ注意点があります。

```ts
await lastValueFrom(observable$);
```

は、Observableが`complete`しないと終わりません。

例えば、

```ts
interval(1000)
```

は永遠にcompleteしないので、

```ts
await lastValueFrom(interval(1000));
```

は永遠に待ち続けます。

ただ今回の、

```ts
lastValueFrom(
  forkJoin([
    HttpClientの通信,
    HttpClientの通信
  ])
)
```

なら、HttpClientは通常1回レスポンスを返してcompleteするので、この問題には当たりにくいです。

なので実務上は、私はこう整理します。

| 状況                              | 選択                             |
| ------------------------------- | ------------------------------ |
| HTTPを1〜数本呼んで、全部終わったら次へ進む        | `await lastValueFrom()` はかなりアリ |
| 処理を上から順番に読みたい                   | `await lastValueFrom()`        |
| `switchMap` 等でObservableをつなげる   | RxJSのまま                        |
| 検索・入力・イベントなど何度も流れてくる            | RxJSのまま                        |
| `takeUntilDestroyed()` で寿命管理したい | RxJSのまま                        |
| NgRx Effect内                    | 基本RxJSのまま                      |

つまり今回のような、

```ts
const [experimentMetrics, modelMetrics] = await lastValueFrom(
  forkJoin([experimentsMetrics, modelsMetrics])
);

useMetrics([experimentMetrics, modelMetrics]);
```

だけを見るなら、**こちらを選ぶのは全然おかしくないです。むしろ単発処理なら読みやすい。**

ただしClearMLのAngularコードを読む・書くという文脈では、

> 「Observableを最終的に1回だけ値として取り出したい」

ときだけPromise化する、と考えた方がいいです。

Observableの途中で安易に、

```ts
lastValueFrom()
```

してしまうと、せっかくのRxJSの「流れを組み立てる能力」をそこで捨てることになります。

一言でまとめると、

> **単発処理なら `await lastValueFrom()` は読みやすい。ストリーム処理ならRxJSのまま。**

この線引きがかなり実務的です。



---
--- `await` を使いたいから `lastValueFrom` を使います。
---
---


`await` を使いたいから `lastValueFrom` を使います。

`forkJoin(...)` は Observable を返しますが、`await` が待てるのは Promise です。  
そこで `lastValueFrom` が Observable を Promise に変換します。

```ts
const scalars = await lastValueFrom(
  forkJoin([experimentsMetrics, modelsMetrics])
);
```

これにより、後続処理を上から順に書けます。

```ts
const scalars = await lastValueFrom(forkJoin([experimentsMetrics, modelsMetrics]));

useMetrics(scalars);
```

また、`lastValueFrom` は Observable が複数回値を流す場合でも、**完了時の最後の値**を Promise の解決値にします。`forkJoin` 自体は各 Observable の最後の値を一度だけまとめて流して完了するため、相性がよいです。

他の書き方です。

```ts
forkJoin([experimentsMetrics, modelsMetrics]).subscribe({
  next: ([experimentMetrics, modelMetrics]) => {
    useMetrics([experimentMetrics, modelMetrics]);
  },
  error: (error) => {
    handleError(error);
  },
});
```

Observable の流れを維持する書き方です。ただし、ネストしやすく、コンポーネントでは購読解除の管理も意識する必要があります。

```ts
const [experimentMetrics, modelMetrics] = await lastValueFrom(
  forkJoin([experimentsMetrics, modelsMetrics])
);
```

同じ方法ですが、配列を分割代入できるので、通常はこちらのほうが読みやすいです。

```ts
const scalars$ = forkJoin([experimentsMetrics, modelsMetrics]).pipe(
  map(([experimentMetrics, modelMetrics]) => ({
    experimentMetrics,
    modelMetrics,
  })),
);
```

```ts
scalars$.subscribe(({ experimentMetrics, modelMetrics }) => {
  useMetrics([experimentMetrics, modelMetrics]);
});
```

RxJS 内で加工・結合を続けたい場合に向きます。

```ts
const value = await firstValueFrom(metrics$);
```

最初の値だけ欲しい場合はこちらです。ただし `forkJoin` では一度しか値を流さないため、実質 `lastValueFrom` と同じ結果になります。

使い分けは、単発の非同期処理を直列的に書きたいなら `await + lastValueFrom`、画面の更新など継続的な値の流れを扱いたいなら Observable のまま `pipe` / `subscribe` が基本です。

---
--- firstValueFrom、lastValueFrom
---
---

ユースケースで見ると、かなり分かりやすくなります。

`firstValueFrom()` は「Observableをずっと監視したいわけではない。今この処理のために、1回だけ値を取って普通の変数として使いたい」です。

例えば Angular で保存ボタンを押したとき。

```ts
async save() {
  const user = await firstValueFrom(
    this.store.select(selectCurrentUser)
  );

  await this.api.save({
    userId: user.id,
    name: this.name()
  });
}
```

やりたいことは、

```text
Storeを監視したい
```

ではなく、

```text
保存する瞬間のユーザー情報を1回だけ欲しい
↓
普通の値 user として使いたい
```

です。

なので `firstValueFrom()`。

もう1つ典型的なのが HTTP です。

```ts
async load() {
  const result = await firstValueFrom(
    this.http.get('/api/experiments')
  );

  console.log(result);
}
```

これは、

```text
HTTPレスポンスが1回来る
↓
その値を await で受け取る
↓
次の処理へ進む
```

という普通の非同期処理として書きたいケースです。

一方 `lastValueFrom()` は、かなり用途が限定されます。

例えば「複数回値が流れて、最後に complete する Observable」で、

```ts
const result = await lastValueFrom(
  of('step1', 'step2', 'step3')
);

console.log(result);
// step3
```

となります。

実務っぽくすると、バッチ処理や一連の処理が、

```text
10%
↓
50%
↓
100%
↓
complete
```

のように流れてきて、

```text
途中経過はいらない
全部終わった時点の最終結果だけ欲しい
```

なら `lastValueFrom()` です。

ただし Angular の普段のコードでは、`lastValueFrom()` はそれほど頻出しません。

特に NgRx Store に対して、

```ts
await lastValueFrom(
  this.store.select(selectExperiments)
);
```

は危険です。

Store は、

```text
値A
↓
値B
↓
値C
↓
値D
↓
……
```

と基本的に終わらないからです。

`lastValueFrom()` は、

```text
「最後の値はどれ？」
```

と聞いているのに、

```text
Store
「まだ終わってません」
```

となるので、ずっと待ち続けます。

ClearML系の画面改修で考えるなら、こんな整理です。

```text
実験一覧Storeから
「今選択されているExperimentを1回だけ取って
API処理に使いたい」

→ firstValueFrom()
```

```text
実験Storeの変更をずっと画面に反映したい

→ firstValueFrom()ではない
→ Observable / Signal のまま使う
```

```text
何段階か結果が流れてきて、
処理完了時の最終結果だけ欲しい

→ lastValueFrom()
```

なので、実務感覚ではまずこれで十分です。

**`firstValueFrom()` = Observable世界から一瞬だけ値を取り出して、async/await世界へ持ってくる。**

**`lastValueFrom()` = Observableが終わるまで待って、その最後の値を取る。**

そして Angular/NgRx のコードリーディングでは、まず `firstValueFrom()` の方を重点的に覚えておけばいいです。`lastValueFrom()` は見かけたときに「このObservable、本当にcompleteするのか？」を確認する、くらいで十分です。
