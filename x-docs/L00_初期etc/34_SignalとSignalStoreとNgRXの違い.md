
```
NgRx
├─ Store
│    └─ Redux型のグローバル状態管理
│       **NgRx Storeの強みは、何が起きたかをActionとして残せること**
│
└─ Signals
     └─ Signal型の状態管理
          └─ SignalStore
```

---

- Signalは「変数の強化版」
  + コンポーネント内だけで完結させる場合
- SignalStoreは「Signalを使った状態管理クラス」
  + 複数コンポーネントでAction履歴が必要ない規模の場合

---

- NgRx Store
  + Action を中心に状態を変更する Redux 型
  + 「何が起きたか」を中心に設計する

- SignalStore
  + Signal を中心に、状態と処理をひとまとめにする方式
  + 「今どんな状態で、どう操作するか」を中心に設計する

---

> 新しい画面の作成や、複数ダイアログが必要な変更開発の場合は?

そのケースなら、「新しい画面だからSignalStore」「ダイアログが多いからNgRx Store」では決めません。  
見るべきなのは、状態の「共有範囲」と「寿命」です。

NgRx公式も、アプリ全体で共有される状態や、ルートをまたいで保持したい状態、外部取得や他のActionから影響を受ける状態には Store を使う指針を示しています。一方、そこまでグローバルではない状態には NgRx Signals が候補です

| 状態                          | 向いているもの           |
| --------------------------- | ----------------- |
| 画面内だけの開閉・選択状態                   | `signal()`        |
| 1画面内で複数Componentが共有                | SignalStore       |
| 複数ダイアログ間で一時的に共有                | SignalStore       |
| 画面＋ダイアログで共有する編集中データ         | SignalStoreがかなり有力 |
| 他画面でも使う業務データ                     | NgRx Store        |
| 画面遷移して戻っても保持したい                | NgRx Store寄り      |
| 他FeatureのActionにも反応する               | NgRx Store        |
| API取得→成功/失敗→一覧更新などを全体で追跡したい | NgRx Store        |
| 既存FeatureがすでにNgRx Store中心           | 基本は既存Storeを拡張     |

NgRx公式も Store を使う目安として、Shared / Hydrated / Available / Retrieved / Impacted、つまり「広く共有される」「再訪時にも必要」「外部取得を伴う」「他のActionの影響を受ける」などを挙げています。





--- 初期AI解説

ざっくり言うと、

**Signal = 1つのリアクティブな値を持つ仕組み**
**SignalStore = 複数のSignalや処理をまとめて「状態管理の箱」にしたもの**

です。

たとえば Angular の Signal なら、

```ts
const count = signal(0);

count.set(10);
count.update(v => v + 1);

console.log(count()); // 11
```

これは単純に、

> 「countという値を持っていて、変わったらAngularが追跡してくれる」

ものです。

複数の値を持つこともできます。

```ts
const experiments = signal<Experiment[]>([]);
const loading = signal(false);
const selectedId = signal<string | null>(null);

const selectedExperiment = computed(() =>
  experiments().find(x => x.id === selectedId())
);
```

これでも普通に状態管理はできます。

ただ、規模が大きくなると、

```text
experiments
loading
selectedId
filter
sort
page
error
```

などがバラバラに増え、

「誰が変更するのか」
「API取得処理はどこか」
「派生値はどこに置くか」

が散らかってきます。

そこで SignalStore です。

```ts
export const ExperimentStore = signalStore(
  withState({
    experiments: [],
    loading: false,
    selectedId: null
  }),

  withComputed((store) => ({
    selectedExperiment: computed(() =>
      store.experiments().find(
        x => x.id === store.selectedId()
      )
    )
  })),

  withMethods((store) => ({
    select(id: string) {
      patchState(store, { selectedId: id });
    }
  }))
);
```

考え方としては、

```text
Signal
↓
値そのもの

SignalStore
↓
状態
＋ 派生状態
＋ 状態変更処理
＋ 非同期処理
などをまとめたもの
```

です。

特に重要なのは、**SignalStoreの内部もSignalでできている**ということです。

つまり、

```text
SignalStore vs Signal
```

というより、

```text
Signal
    ↓
これを土台として

SignalStore
    ├─ state
    ├─ computed
    ├─ methods
    └─ async処理
```

という関係です。

ClearMLのような画面で考えると分かりやすいです。

たとえば単純な開閉状態なら、

```ts
const isPanelOpen = signal(false);
```

だけで十分です。

一方、実験一覧画面で、

```text
実験一覧
検索条件
選択中実験
Loading
ページ番号
ソート
API取得
再取得
エラー
```

などをまとめて扱うなら、SignalStoreのほうが整理しやすくなります。

一番実務的な判断基準はこれです。

| 状況              | 選択             |
| --------------- | -------------- |
| Component内だけの値  | `signal()`     |
| UIのちょっとした状態     | `signal()`     |
| 派生値             | `computed()`   |
| 複数Componentで共有  | SignalStoreを検討 |
| API取得＋状態更新      | SignalStoreが有力 |
| 画面単位のまとまった状態    | SignalStoreが有力 |
| アプリ全体で複雑なイベント管理 | NgRx Storeも候補  |

なので、かなり乱暴に一言で覚えるなら、

**Signalは「変数の強化版」
SignalStoreは「Signalを使った状態管理クラス」**

くらいで最初は大丈夫です。

なお、`NgRx Store` と `SignalStore` の違いはまた別の話で、ここは実務ではかなり重要です。ClearMLを読むなら次にここを押さえると整理しやすいです。

---

かなり重要な違いです。Angular 22 / NgRx 22 の現在の整理では、ざっくりこうです。

**NgRx Store = Action を中心に状態を変更する Redux 型**
**SignalStore = Signal を中心に、状態と処理をひとまとめにする方式**

NgRx公式も、アプリ全体で共有するような状態には Store、そこまでグローバルでない状態には NgRx Signals を検討する、という位置づけをしています。([NgRx][1])

NgRx Store はこう流れます。

```text
Component
   ↓
dispatch(Action)
   ↓
Reducer
   ↓
State変更
   ↓
Selector
   ↓
Component

        └→ Effect → API
```

たとえば「実験を選択する」なら、

```ts
this.store.dispatch(
  experimentActions.selectExperiment({ id })
);
```

Component は基本的に、

> 「selectedId をこの値に書き換えて」

とは言いません。

代わりに、

> 「Experiment Selected という出来事が起きました」

と Action を投げます。

Reducer がその Action を受けて State を変更します。

```ts
on(
  experimentActions.selectExperiment,
  (state, { id }) => ({
    ...state,
    selectedId: id
  })
)
```

取得するときは Selector。

```ts
this.selectedExperiment$ =
  this.store.select(selectSelectedExperiment);
```

つまり Store はかなり厳格です。

```text
Action
↓
Reducer
↓
State
↓
Selector
```

さらにAPI通信なら Effect が入ります。

```text
Action
↓
Effect
↓
API
↓
成功Action
↓
Reducer
↓
State
```

NgRxのschematicでも、featureを生成すると `actions / effects / reducer / selectors` という構成が基本になっています。([NgRx][2])

一方 SignalStore はかなり直接的です。

```text
Component
   ↓
Storeのmethod
   ↓
patchState()
   ↓
Signal更新
   ↓
Component
```

イメージはこうです。

```ts
export const ExperimentStore = signalStore(
  withState({
    experiments: [],
    selectedId: null,
    loading: false
  }),

  withComputed((store) => ({
    selectedExperiment: computed(() =>
      store.experiments().find(
        x => x.id === store.selectedId()
      )
    )
  })),

  withMethods((store) => ({
    select(id: string) {
      patchState(store, {
        selectedId: id
      });
    }
  }))
);
```

Component側は、

```ts
store = inject(ExperimentStore);

select(id: string) {
  this.store.select(id);
}
```

これで終わります。

つまり SignalStore では、

```text
Action
Reducer
Selector
```

を必ず用意する必要がありません。

ここが一番大きい差です。

比較するとこうなります。

|              | NgRx Store       | SignalStore             |
| ------------ | ---------------- | ----------------------- |
| 基本思想         | Redux            | Signalベース               |
| 状態変更         | Action → Reducer | method → `patchState()` |
| 状態取得         | Selector         | Signalを直接読む             |
| 派生値          | Selector         | `computed()`            |
| API処理        | Effects          | method / `rxMethod` など  |
| RxJS         | 強く使う             | 必要なところで使う               |
| ボイラープレート     | 多め               | 少ない                     |
| 状態変更履歴       | Actionとして明確      | Store内method中心          |
| DevToolsとの相性 | 非常に強い            | StoreほどAction中心ではない     |
| 大規模な横断状態     | 得意               | 用途次第                    |
| Feature単位の状態 | 得意               | とても得意                   |

ここでかなり大事なのが、「SignalStoreはNgRx Storeの新しい書き方」という理解は少し違います。

両者は、

```text
旧
NgRx Store
    ↓
新
SignalStore
```

という単純な後継関係ではありません。

むしろ、

```text
NgRx
├─ Store
│    └─ Redux型のグローバル状態管理
│
└─ Signals
     └─ Signal型の状態管理
          └─ SignalStore
```

という別系統です。

NgRx Storeの強みは、**何が起きたかをActionとして残せること**です。

たとえば、

```text
Experiment Page Opened
Experiment Loaded
Experiment Selected
Experiment Deleted
Experiment Delete Succeeded
```

というイベントが全部流れます。

そのため巨大システムで、

> 「なぜ今このstateになった？」

を追跡しやすい。

Redux DevToolsでもActionとstate変化を追跡できます。NgRx公式もStoreの利点として、状態のserializabilityやDevToolsによるAction/stateの検査を挙げています。([NgRx][1])

SignalStoreは逆に、

```ts
store.selectExperiment(id);
```

を見れば、

> ああ、選択状態を変えてるな

と分かります。

コード量も少なく、AngularのSignalとも自然につながります。

なので、ClearMLくらいの規模を読むときには、私はこう頭を切り替えるのが分かりやすいと思います。

```text
NgRx Storeを見たら

「何のAction？」
       ↓
「どのEffect？」
       ↓
「どのReducer？」
       ↓
「どのSelector？」
```

SignalStoreを見たら、

```text
「どのStore？」
    ↓
「どのmethod？」
    ↓
「どのstateをpatch？」
    ↓
「どのcomputedが依存？」
```

です。

特に現在のClearMLコードリーディングなら、ここはかなり重要です。

**NgRx Storeは「イベントの流れを追う」**

```text
dispatch
 ↓
Action
 ↓
Effect
 ↓
Reducer
 ↓
Selector
```

**SignalStoreは「Storeの中を見る」**

```text
method
 ↓
patchState
 ↓
state
 ↓
computed
```

この違いを頭に置くと、状態管理コードを見た瞬間に「追跡ルート」が変わります。

そして最大の覚え方はこれです。

> **NgRx Store = 「何が起きたか」を中心に設計する**
>
> **SignalStore = 「今どんな状態で、どう操作するか」を中心に設計する**

ClearMLのような既存の大規模NgRxコードを読むなら、まず NgRx Store の `Action → Effect → Reducer → Selector` を完全に追えるようにするほうが優先度は高いです。SignalStoreはその後でも理解しやすいです。([NgRx][1])

[1]: https://ngrx.io/guide/store/why?utm_source=chatgpt.com "NgRx"
[2]: https://ngrx.io/guide/schematics/feature?utm_source=chatgpt.com "NgRx"

---

> | 他画面でも使う業務データ                     | NgRx Store        |
> | 画面遷移して戻っても保持したい                | NgRx Store寄り      |
> | 他FeatureのActionにも反応する               | NgRx Store        |
> 
> これだけ見ると、規模次第って感じですか

そうです。かなり本質的には「規模次第」です。
ただし、正確には**コード量の規模というより「状態の影響範囲の規模」**で決まります。

NgRx公式も Store を使う目安として、Shared / Hydrated / Available / Retrieved / Impacted、つまり「広く共有される」「再訪時にも必要」「外部取得を伴う」「他のActionの影響を受ける」などを挙げています。([NgRx][1])

たとえば、

```text
画面A
 ├─ Dialog A
 ├─ Dialog B
 └─ Dialog C
```

この中だけで完結しているなら、登場Componentが多くても SignalStore で十分ありえます。

逆に、

```text
画面A
  ↓
画面B
  ↓
画面C

さらに
別Feature
WebSocket
Router
他のAction
からも状態変更
```

となってくると、NgRx Store の価値が急に大きくなります。

なので「何画面あるか」より、

> **その状態に何人が関わってくるか**

と考えたほうが分かりやすいです。

例えば同じ `Experiment` でも、

```text
ExperimentEditPage
 ├─ 入力途中のname
 ├─ 選択中parameter
 ├─ 開いているdialog
 └─ validation状態
```

これは画面ローカルなので SignalStore 寄り。

一方で、

```text
experiments一覧
selectedExperiment
実行状態
削除結果
Taskとの関連
Projectとの関連
別画面からの更新
```

ここまで広がれば NgRx Store 寄りです。

つまり境界はこんな感じです。

```text
小さい
│
├─ Component内
│    → signal
│
├─ 1画面・1Feature内
│    → SignalStore
│
├─ 複数画面・複数Feature
│    → SignalStore / NgRx Store の境界
│
└─ アプリ全体・複数イベント源
     → NgRx Store

大きい
```

ただし、この境界は固定ではありません。

たとえば「画面遷移しても保持したい」だけなら、必ずNgRx Storeというわけではありません。SignalStoreを上位providerで生存させたり、URLやstorageに状態を持たせたりする設計もできます。

逆に1画面しかなくても、

```text
ユーザー操作
API
WebSocket
バックグラウンド更新
他Action
```

が全部その状態に影響するなら、NgRx Storeにする価値があります。

NgRx Storeの強みは単に「大きいデータを置ける」ことではなく、

```text
何が起きた？
 ↓
Action

それに対して何をする？
 ↓
Effect / Reducer

その結果どうなった？
 ↓
State
```

という**因果関係を明示できること**です。DevToolsでもActionとstate変化を追跡できます。([NgRx][2])

なので実務では、

> **SignalStoreで収まるうちはSignalStore。
> 状態変更の原因が画面の外からどんどん入ってきたらNgRx Storeを検討。**

くらいの感覚がかなり良いです。

ClearMLのような規模なら特に、単純な「大規模だから全部NgRx Store」ではなく、

```text
アプリ全体の業務状態
→ NgRx Store

Feature・画面固有状態
→ SignalStore

Component固有UI状態
→ signal
```

という三段階で考えると整理しやすいです。

[1]: https://ngrx.io/guide/store/why?utm_source=chatgpt.com "NgRx"
[2]: https://ngrx.io/guide/store-devtools?utm_source=chatgpt.com "NgRx"
