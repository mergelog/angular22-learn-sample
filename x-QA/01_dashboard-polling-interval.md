# Dashboard polling interval QA

## Q. `timer(0, this.pollingIntervalMs)` は何をしているか

ダッシュボードのデータ取得を、開始直後と指定間隔ごとに実行するための RxJS `timer` です。

```ts
timer(0, this.pollingIntervalMs)
```

- 第1引数 `0`: 購読直後に最初の値を通知する
- 第2引数 `this.pollingIntervalMs`: 以降の通知間隔をミリ秒で指定する

既定値の `5_000` が使われる場合、開始直後に1回、その後は5秒ごとに `loadRequested` を発行します。

## Q. `factory: () => 5_000` は `timer` のコールバックか

違います。これは Angular の依存性注入（DI）が
`DASHBOARD_POLLING_INTERVAL_MS` の提供値を必要としたときに呼び出すファクトリーです。

```ts
export const DASHBOARD_POLLING_INTERVAL_MS = new InjectionToken<number>(
  'DASHBOARD_POLLING_INTERVAL_MS',
  {
    factory: () => 5_000,
  },
);
```

この結果、Effects が受け取る値は数値の `5_000` です。

```ts
timer(0, this.pollingIntervalMs);
```

`timer(0, () => 5_000)` は、第2引数に数値ではなく関数を渡すため使用できません。

## Q. `timer(0, 5000)` でもよいか

動作は同じです。`5_000` と `5000` は同じ数値です。

ただし Effects に値を直接書くと、テストや環境別の設定で間隔を変える際に Effects 自体を変更する必要があります。そのため、Effects はDIから取得した値を使います。

## Q. テストでは設定ファイルをmockするのか

通常は `dashboard.config.ts` をモジュールmockしません。テスト用のDI設定でトークンの提供値を上書きします。

```ts
{
  provide: DASHBOARD_POLLING_INTERVAL_MS,
  useValue: 10,
}
```

Effects は次のようにトークンを注入しているため、テストでは `10`、本番では既定値の `5_000` を受け取れます。

```ts
private readonly pollingIntervalMs = inject(DASHBOARD_POLLING_INTERVAL_MS);
```

会話上は「設定値をmockする」と表現しても通じますが、厳密にはDIプロバイダの上書き・差し替えです。
