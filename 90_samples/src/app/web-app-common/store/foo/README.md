# foo store

`p02-ngrx-http/listing-foo` が使うデータ。HTTP レスポンスは `mod-httpInterceptorFn` のスタブが返す。

```
pollingStarted → timer(0, 3s) → loadRequested → FooApi.getFooList() → loadSucceeded → reducer → Store
                                                                   ↘ loadFailed
pollingStopped → takeUntil でタイマーを解除
```

- `foo.effects.ts` は state と同じこの配下（AGENTS.md の「Effects は更新対象 state の feature 配下」）
- `provideState(fooFeature)` / `provideEffects(FooEffects)` の登録は `feature/p02-ngrx-http/p02-ngrx-http.routes.ts`
- 他ページでも foo を使うようになったら、登録を `app.config.ts` に引き上げる
