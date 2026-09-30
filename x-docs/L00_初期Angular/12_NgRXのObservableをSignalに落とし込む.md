
> グローバルでNgRX使っていても、コンポーネントで使うときに Signalに一旦落とし込んだりしますか

あります。むしろ今の Angular + NgRx では、かなり自然な構成です。

イメージはこうです。

`NgRx Store = アプリ全体の状態管理`
↓
`Component = Signal として受け取る`
↓
`Template = Signal を読む`

たとえば NgRx Store 側がグローバル状態を持っていても、コンポーネントではこうできます。

```ts
@Component({...})
export class ExperimentListComponent {
  private readonly store = inject(Store);

  readonly experiments = this.store.selectSignal(selectExperiments);
  readonly loading = this.store.selectSignal(selectExperimentsLoading);
}
```

テンプレートでは、

```html
@if (loading()) {
  <p>Loading...</p>
}

@for (experiment of experiments(); track experiment.id) {
  <div>{{ experiment.name }}</div>
}
```

つまり、

```text
NgRx Store
   ↓ selector
Signal
   ↓
Component / Template
```

という形です。

ここで重要なのは、これは「NgRxをやめてSignalへコピーしている」のではありません。

```ts
readonly experiments = this.store.selectSignal(selectExperiments);
```

は、Storeを元データとして持ったまま、その値を見るインターフェースをSignalにしているだけです。

なので、

```text
Store更新
  ↓
selector再計算
  ↓
experiments Signal更新
  ↓
Template更新
```

となります。

逆に、これはあまりやりません。

```ts
readonly experiments = signal<Experiment[]>([]);

constructor() {
  this.store.select(selectExperiments).subscribe(value => {
    this.experiments.set(value);
  });
}
```

Store → Observable → 手動subscribe → Signalへコピー

となり、状態を二重管理しやすくなります。

NgRxを使っているなら、

```ts
this.store.selectSignal(...)
```

で直接Signalとして取り出す方がきれいです。

また、グローバルNgRxとコンポーネントローカルSignalは普通に共存します。

```ts
export class ExperimentListComponent {
  private readonly store = inject(Store);

  // グローバル状態
  readonly experiments = this.store.selectSignal(selectExperiments);

  // この画面だけの状態
  readonly searchText = signal('');
  readonly selectedId = signal<string | null>(null);

  // 両方から画面表示用データを作る
  readonly filteredExperiments = computed(() => {
    const keyword = this.searchText();

    return this.experiments().filter(x =>
      x.name.includes(keyword)
    );
  });
}
```

この分担はかなり分かりやすいです。

| 状態 | 置き場所 |
|---|---|
| ログインユーザー | NgRx Store |
| Experiment一覧 | NgRx Store |
| API取得状態 | NgRx Store |
| 複数画面で共有する条件 | NgRx Store |
| 検索欄の入力途中 | Component Signal |
| 開閉状態 | Component Signal |
| 選択中のタブ | Component Signal |
| Storeから作る表示用値 | `computed()` |

なので、大規模Angularをコードリーディングするときは、

```text
this.store.selectSignal(...)
```

を見つけたら、

「このコンポーネントはNgRxのグローバル状態をSignal世界に持ち込んで使っている」

と考えるとかなり整理しやすいです。

特に今の構成なら、私は次の3層で見るのをおすすめします。

```text
NgRx
＝ アプリ全体の状態・イベント・副作用

Signal
＝ コンポーネントから見たリアクティブな値

computed
＝ 画面表示用の派生値
```

つまり「グローバルではNgRx、コンポーネント内部ではSignal」は、別思想が衝突しているのではなく、かなり相性のいい組み合わせです。

> 逆に、一旦落とし込まずに、直接使うケースを提示

あります。代表例は、NgRx の `Observable` をそのまま使うケースです。

一番わかりやすいのはこれです。

```ts
export class ExperimentListComponent {
  private readonly store = inject(Store);

  readonly experiments$ = this.store.select(selectExperiments);
  readonly loading$ = this.store.select(selectExperimentsLoading);
}
```

テンプレート側で直接 `async` します。

```html
@if (experiments$ | async; as experiments) {
  @for (experiment of experiments; track experiment.id) {
    <div>{{ experiment.name }}</div>
  }
}

@if (loading$ | async) {
  <p>Loading...</p>
}
```

流れは、

```text
NgRx Store
   ↓
select()
   ↓
Observable
   ↓
async pipe
   ↓
Template
```

です。

Signal に落とす場合は、

```ts
readonly experiments = this.store.selectSignal(selectExperiments);
```

なので、

```text
NgRx Store
   ↓
selectSignal()
   ↓
Signal
   ↓
Template
```

となります。

直接 Observable のまま使うのが向いているのは、特に RxJS の処理を続けたい場合です。

```ts
readonly visibleExperiments$ = this.store
  .select(selectExperiments)
  .pipe(
    map(experiments =>
      experiments.filter(x => x.status === 'running')
    )
  );
```

さらに、

```ts
readonly result$ = combineLatest([
  this.store.select(selectExperiments),
  this.store.select(selectSelectedProject),
]).pipe(
  map(([experiments, project]) =>
    experiments.filter(x => x.projectId === project?.id)
  )
);
```

こういうコードなら、途中で Signal に変換する必要はありません。

もう一つ重要なのが Effect です。Effect は基本的に Observable 世界のままです。

```ts
loadExperiments$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ExperimentsActions.load),
    switchMap(() =>
      this.api.getExperiments().pipe(
        map(experiments =>
          ExperimentsActions.loadSuccess({ experiments })
        )
      )
    )
  )
);
```

ここでわざわざ Signal にする理由はありません。

整理するとこうです。

| ケース | そのまま使う形 |
|---|---|
| Template表示だけ | `store.select()` + `async` |
| RxJS加工を続ける | `select().pipe(...)` |
| 複数Observableを合成 | `combineLatest` など |
| NgRx Effects | Observableのまま |
| イベント発火 | `store.dispatch()` |
| Signal中心のComponent | `selectSignal()` |

実務では、

```text
昔からあるNgRxコード
→ select() + async

新しめのSignal中心Component
→ selectSignal()
```

という混在もかなり自然です。

なので、コードリーディング中に

```ts
experiments$ = this.store.select(...)
```

を見たら、

「NgRx の Observable を Signal 化せず、そのまま Component / Template で使っている」

と判断すればOKです。

> SignalStoreの場合はどうですか

SignalStore の場合は、少し話が変わります。

SignalStore は最初から Signal を公開する設計なので、基本的に「いったん Signal に落とし込む」という工程そのものがありません。NgRx v22 の `SignalStore` は state の各プロパティを `DeepSignal` として公開します。:chatgpt-content-reference{index="0"}

たとえば Store がこうなら、

```ts
export const ExperimentStore = signalStore(
  withState({
    experiments: [] as Experiment[],
    loading: false,
  })
);
```

コンポーネントでは、

```ts
export class ExperimentListComponent {
  readonly store = inject(ExperimentStore);
}
```

テンプレートから直接、

```html
@if (store.loading()) {
  <p>Loading...</p>
}

@for (experiment of store.experiments(); track experiment.id) {
  {{ experiment.name }}
}
```

と使えます。

流れは単純です。

```text
SignalStore
   ↓
store.experiments()
   ↓
Template
```

つまり、Global Store の場合の

```ts
store.select(...)
```

や

```ts
store.selectSignal(...)
```

に相当する「取り出し処理」が、SignalStoreではかなり薄くなります。

比較するとこうです。

| 状態管理 | コンポーネントでの典型 |
|---|---|
| NgRx Global Store | `store.select(selector)` |
| NgRx Global Store + Signal | `store.selectSignal(selector)` |
| SignalStore | `store.experiments()` |

SignalStoreでも、コンポーネント側でさらに `computed()` を作ることは普通にあります。

```ts
export class ExperimentListComponent {
  readonly store = inject(ExperimentStore);

  readonly runningExperiments = computed(() =>
    this.store.experiments().filter(
      x => x.status === 'running'
    )
  );
}
```

これは「Signalに落とした」のではなく、

```text
SignalStoreのSignal
        ↓
computedで派生Signalを作る
```

です。

もっと重要なのはここです。

SignalStore側に `withComputed()` があれば、コンポーネントでそれすら作らず直接使えます。

```ts
export const ExperimentStore = signalStore(
  withState({
    experiments: [] as Experiment[],
  }),

  withComputed(({ experiments }) => ({
    runningExperiments: computed(() =>
      experiments().filter(
        x => x.status === 'running'
      )
    ),
  }))
);
```

コンポーネントは、

```ts
readonly store = inject(ExperimentStore);
```

だけ。

テンプレートは、

```html
@for (
  experiment of store.runningExperiments();
  track experiment.id
) {
  {{ experiment.name }}
}
```

となります。

なので、コードリーディングの感覚としては、次の違いを押さえておくとかなり楽です。

```text
NgRx Store

Store
 ↓
Selector
 ↓
Observable / Signal
 ↓
Component
```

一方、

```text
SignalStore

SignalStore
 ↓
Signal
 ↓
Component
```

です。

そしてSignalStoreでは、

```text
store.experiments()
store.loading()
store.selectedExperiment()
```

のようなものを見つけたら、かなりの確率で「これはもうStoreの状態そのもの、またはStore内で作った派生Signalだ」と考えてよいです。

逆に、

```ts
const experiments = signal(store.experiments());
```

のようにコンポーネント側でもう一度Signalへコピーするのは、通常は不要です。

これをやると、

```text
SignalStore
   ↓
Signal
   ↓
別のSignalへコピー
```

となって、どちらが状態の本体なのか分かりにくくなります。

なので大きく分けると、

```text
Global NgRx Store
→ Signalとして受け取ることがある

SignalStore
→ もう最初からSignal
```

という理解でかなり正確です。

さらに一歩進めると、SignalStoreをコードリーディングするときは、`store.xxx()` を見たら次に `withState` / `withComputed` / `withMethods` のどこで `xxx` が生えているかを探す、という追い方が基本になります。NgRx公式も現在、グローバルな状態管理は `Store`、ローカルな状態管理には NgRx Signals を選択肢として案内しています。:chatgpt-content-reference{index="1"}

