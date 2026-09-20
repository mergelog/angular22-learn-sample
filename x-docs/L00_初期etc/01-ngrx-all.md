この `store` は Dashboard の画面状態と、データ取得の流れを NgRx で管理しています。

```text
DashboardService
  └─ dispatch(Action)
       ├─ Reducer → State を更新
       └─ Effect  → API 呼び出しなど副作用を実行
                       └─ dispatch(Action)
Selector
  └─ State から画面用データを取り出す
```

### Action

[dashboard.actions.ts](../07_createFeature/src/app/features/dashboard/store/dashboard.actions.ts)

「何が起きたか」を表すイベントです。Action 自体は状態を変えず、処理もしません。

- `pollingStarted`: 定期取得を開始する
- `pollingStopped`: 定期取得を止める
- `loadRequested`: Dashboard の取得を要求する
- `loadSucceeded({ items })`: 取得成功。Lot 一覧を持つ
- `loadFailed({ error })`: 取得失敗。エラー文を持つ

例えば `DashboardActions.loadRequested()` は、「読み込み処理を実行してほしい」という通知です。

### Reducer

[dashboard.reducer.ts](..07_createFeature/src/app/features/dashboard/store/dashboard.reducer.ts)

Action を受けて、Store 内の状態を更新する純粋な関数です。API 呼び出しなどはしません。

管理している状態は次の3つです。

```ts
{
  items: [],       // 一覧データ
  loading: false,  // 読み込み中か
  error: null,     // エラー文
}
```

更新内容は以下です。

| Action | State の変化 |
|---|---|
| `loadRequested` | `loading: true`、過去の `error` を消す |
| `loadSucceeded` | `items` を保存し、`loading: false` |
| `loadFailed` | `loading: false`、`error` を保存 |

`...state` は、変更しない項目を残したまま、新しい State オブジェクトを返すための書き方です。

`createFeature({ name: 'dashboard' })` により、Store の中では `dashboard` という名前でこの状態を登録します。実際の登録は [dashboard.routes.ts](/Users/yasu/work/mergelog/angular22-sample/07_createFeature/src/app/features/dashboard/dashboard.routes.ts) の `provideState(dashboardFeature)` です。

### Selector

[dashboard.selectors.ts](/Users/yasu/work/mergelog/angular22-sample/07_createFeature/src/app/features/dashboard/store/dashboard.selectors.ts)

Store 全体から必要な値だけを取り出すための関数です。Component が State の内部構造を直接知る必要がなくなります。

- `selectItems`: 一覧データ
- `selectLoading`: 読み込み状態
- `selectError`: エラー
- `selectViewModel`: 画面が使う3値をまとめたもの

画面は `DashboardService` 経由で `selectViewModel` を購読し、テンプレートで `items`、`loading`、`error` を使っています。

### Effect

[dashboard.effects.ts](/Users/yasu/work/mergelog/angular22-sample/07_createFeature/src/app/features/dashboard/store/dashboard.effects.ts)

Action をきっかけに、HTTP 通信・タイマーのような副作用を担当します。Effect は結果として次の Action を dispatch します。

このコードには2つあります。

1. `startPolling$`

   `pollingStarted` を受けると、すぐに1回、その後は5秒ごとに `loadRequested` を発行します。`pollingStopped` を受けると停止します。

2. `loadDashboard$`

   `loadRequested` を受けると API を呼びます。

   - 成功: レスポンスを画面用の `Lot` に変換し、`loadSucceeded({ items })`
   - 失敗: エラー文を作り、`loadFailed({ error })`

`exhaustMap` は、前回の取得が終わるまで次の取得要求を無視します。ポーリングで通信が重なることを防ぐ用途です。

`provideEffects(DashboardEffects)` によって、この Effect も Dashboard ルート配下で有効化されています。