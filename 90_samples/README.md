# 90 Samples

Angular 22 + NgRx。ページごとにお題を分けた学習用サンプル置き場。

```bash
yarn install
yarn start
```

## 構成

```
src/apps/
├── app.ts / app.config.ts / app.routes.ts
├── feature/
│   ├── dashboard/                  p00〜 へのリンク一覧
│   ├── p00-ngrx/                   canvas / effects / novice
│   ├── p01-signals/                canvas / computed / novice
│   ├── p02-ngrx-http/              listing-foo（NgRx で HTTP ポーリング）
│   │   └── mod-httpInterceptorFn/  /api/foo を横取りするスタブバックエンド
│   └── p03-compo/                  canvas
└── web-app-common/
    └── store/foo/                  listing-foo が使うデータの store
```

各 feature は `*.routes.ts` を持ち、`app.routes.ts` から `loadChildren` で遅延読み込みする。

## 導入済み

- Angular 22（standalone / zoneless / vitest）
- `@ngrx/store` `@ngrx/effects`（`app.config.ts` で `provideStore()` `provideEffects()` 済み）
- `@ngrx/signals`（依存のみ。SignalStore は使う場所で個別に定義する）
- `@angular/material` `@angular/cdk`（依存のみ。未使用・未セットアップ）
- `provideHttpClient(withInterceptors([fooBackendInterceptor]))`

## p02-ngrx-http の動き

```
pollingStarted → timer(0, 3s) → loadRequested → FooApi.getFooList() → loadSucceeded → reducer → Store
                                                                   ↘ loadFailed
pollingStopped → takeUntil でタイマーを解除
```

`/api/foo` の GET は `mod-httpInterceptorFn/foo-backend.interceptor.ts` が横取りして、呼ばれるたびに
count を増やしたダミーを返す。`provideState(fooFeature)` と `provideEffects(FooEffects)` は
`p02-ngrx-http.routes.ts` のルート providers で登録している。

## 未実装

- p00-ngrx / p01-signals / p03-compo の各ページは見出しとリンクだけの雛形
