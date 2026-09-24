> const selectExperiments = createSelector(   (state: AppState) => state.experiments,   state => state.items );
> みたいに書いた方が読みやすいけど、大規模だと訳わかんなくなるからってことか

その理解でほぼ合っています。

小規模なら、こう書いても十分読めます。

```ts
const selectExperiments = createSelector(
  (state: AppState) => state.experiments,
  state => state.items
);
```

ただ、大規模になると問題が出ます。

たとえば色々な selector で毎回こうなると、

```ts
const selectExperiments = createSelector(
  (state: AppState) => state.experiments,
  state => state.items
);

const selectLoading = createSelector(
  (state: AppState) => state.experiments,
  state => state.loading
);

const selectSelectedId = createSelector(
  (state: AppState) => state.experiments,
  state => state.selectedId
);
```

毎回、

```ts
(state: AppState) => state.experiments
```

が重複します。

そこで入口を1個にまとめます。

```ts
const selectExperimentsState =
  createFeatureSelector<ExperimentsState>('experiments');

const selectExperiments = createSelector(
  selectExperimentsState,
  state => state.items
);

const selectLoading = createSelector(
  selectExperimentsState,
  state => state.loading
);

const selectSelectedId = createSelector(
  selectExperimentsState,
  state => state.selectedId
);
```

こうすると、

「この3つは全部 experiments feature の selector なんだな」

と一目で分かります。

さらに大規模で効くのは、Store構造を変えたときです。

たとえば、

```ts
state.experiments
```

だったものが設計変更で変わった場合、入口 selector を1箇所直せば済みます。

つまり `createFeatureSelector()` のメリットは、単なる短縮というより、

**Storeの構造を各selectorから隠す**

ことです。

かなり重要な設計上の意味があります。

感覚としては、

```text
直接書く
(state: AppState) => state.experiments
```

は、

「住所を毎回ベタ書き」

です。

一方、

```ts
selectExperimentsState
```

は、

「住所に名前を付ける」

感じです。

なので小規模なら直接書いても問題ありません。

大規模になるほど、

```text
Storeの場所
↓
feature selectorで1回だけ定義
↓
それ以下はその名前だけ使う
```

という形の方が追いやすくなります。

特にClearML級のAngularコードなら、こちらの方が「どのfeatureに属するselectorか」を追いやすいので有利です。
