では `linkedSignal()` の一番重要なところです。

結論からいうと、

**`.set()` した値は保持されます。
ただし、`linkedSignal()` が依存している元Signalが変わると、`computation` が再実行され、その結果で上書きされます。** ([Angular][1])

まずこれです。

```ts
readonly users = signal([
  '田中',
  '佐藤',
  '鈴木',
]);

readonly selectedUser = linkedSignal(() => {
  return this.users()[0];
});
```

最初は、

```text
users
['田中', '佐藤', '鈴木']

selectedUser
'田中'
```

です。

ここでユーザーが「鈴木」を選びます。

```ts
this.selectedUser.set('鈴木');
```

すると、

```text
selectedUser
'鈴木'
```

になります。

このあと何も起きなければ、**ずっと `'鈴木'` のまま**です。

つまり、

```ts
selectedUser.set('鈴木');
```

した直後に勝手に、

```text
田中
```

へ戻るわけではありません。

ここがまず重要です。

では、元の `users` が変わったらどうなるか。

```ts
this.users.set([
  '山田',
  '高橋',
  '伊藤',
]);
```

`selectedUser` の計算式は、

```ts
() => this.users()[0]
```

なので、`users` の変更によって再計算されます。

結果、

```text
selectedUser
'鈴木'

↓ users変更

selectedUser
'山田'
```

になります。公式APIでも `linkedSignal` は「reactive computation によって初期化され、再設定される writable signal」とされています。 ([Angular][1])

流れをまとめると、

```text
① 初期状態

users
['田中', '佐藤', '鈴木']
        ↓
linkedSignal
        ↓
selectedUser = '田中'


② ユーザーが変更

selectedUser.set('鈴木')

selectedUser = '鈴木'
        ↑
この値は保持される


③ users が変更

users
['山田', '高橋', '伊藤']
        ↓
computation 再実行
        ↓
selectedUser = '山田'
```

です。

つまり `linkedSignal()` は、

**「自分で `.set()` した値を永久保存するSignal」ではありません。**

むしろ、

**「普段は自分で変更できるが、元データが変わったらルールに従って再計算するSignal」**

です。

ここで実務上かなり重要な問題があります。

例えば実験一覧です。

```ts
readonly experiments = signal([
  { id: 1, name: '実験A' },
  { id: 2, name: '実験B' },
  { id: 3, name: '実験C' },
]);

readonly selectedExperiment = linkedSignal(() => {
  return this.experiments()[0];
});
```

ユーザーが実験Cを選択します。

```ts
this.selectedExperiment.set(
  this.experiments()[2]
);
```

現在は、

```text
実験C
```

です。

ところが、API再取得などで一覧が変わります。

```ts
this.experiments.set([
  { id: 1, name: '実験A' },
  { id: 2, name: '実験B' },
  { id: 3, name: '実験C' },
  { id: 4, name: '実験D' },
]);
```

実験Cはまだ存在しています。

それでも単純な、

```ts
linkedSignal(() => {
  return this.experiments()[0];
});
```

では再計算されるので、

```text
実験C
 ↓
実験A
```

に戻ってしまいます。

これは困ります。

そこで `linkedSignal()` には、**前回値を見るための高度な書き方**があります。 ([Angular][2])

```ts
readonly selectedExperiment = linkedSignal<
  Experiment[],
  Experiment | undefined
>({
  source: () => this.experiments(),

  computation: (experiments, previous) => {

    const previousSelected = previous?.value;

    if (
      previousSelected &&
      experiments.some(
        experiment =>
          experiment.id === previousSelected.id
      )
    ) {
      return previousSelected;
    }

    return experiments[0];
  },
});
```

ここでは、

```ts
previous?.value
```

で、

**前回 `selectedExperiment` に入っていた値**

を取得できます。 ([Angular][2])

例えば、

```text
現在の選択
実験C
```

で、新しい一覧が、

```text
実験A
実験B
実験C
実験D
```

なら、

```text
実験Cはまだ存在する
        ↓
そのまま実験Cを保持
```

できます。

逆に新しい一覧が、

```text
実験X
実験Y
```

になったら、

```text
以前の実験Cが存在しない
        ↓
先頭の実験Xを選択
```

という制御ができます。

この、

```ts
previous?.value
```

が `linkedSignal()` のかなり強いところです。

単純版なら、

```ts
readonly selected =
  linkedSignal(() => this.items()[0]);
```

で、

```text
元データ変更
↓
先頭へリセット
```

高度版なら、

```ts
linkedSignal({
  source: ...,
  computation: (source, previous) => ...
});
```

で、

```text
元データ変更
↓
前回選択を見る
↓
まだ有効？
├─ YES → 前回選択を維持
└─ NO  → 新しい初期値
```

という設計ができます。 ([Angular][2])

ここまでを `signal / computed / linkedSignal` で整理すると、こうです。

| API              | 元Signal変更時 | `.set()` |
| ---------------- | ---------- | -------: |
| `signal()`       | 関係なし       |        ○ |
| `computed()`     | 自動再計算      |        × |
| `linkedSignal()` | 自動再計算      |        ○ |

そして `linkedSignal()` の `.set()` は、

```text
.set()
↓
手動値を保持
↓
元の依存Signalが変化
↓
computation再実行
↓
計算結果に更新
```

と覚えると正確です。

一言でまとめるなら、

**`linkedSignal()` は「手動変更できる `computed()`」に近い。ただし元データが変わると計算ルールが再び優先される。**

次は `linkedSignal()` の `source` と `computation` を分ける意味をやると、今出てきた `previous` もかなり理解しやすくなります。

[1]: https://next.angular.dev/api/core/linkedSignal?utm_source=chatgpt.com "linkedSignal • Angular"
[2]: https://next.angular.dev/guide/signals/linked-signal?utm_source=chatgpt.com "Dependent state with linkedSignal • Angular"
