# 03 大規模構成サンプル

Angular 22 + NgRx 22。02 までで扱った store / action / reducer / effect を、
**大規模案件でそのまま通用するレイヤー構成に載せ替えた**サンプル。

UI は「商品一覧」「商品詳細」の 2 画面のみ。画面数を増やす代わりに、
構成・依存方向・非同期の扱いを本番相当にしてある。

## 起動

```bash
npm install
npm start        # http://localhost:4200
```

`public/api/` の静的 JSON をモック API として `HttpClient` で取得する。

## ディレクトリ構成

```
src/
  environments/              ビルド構成で差し替わる設定値
  app/
    app.config.ts            ルートの provider（router / http / store / devtools）
    app.routes.ts            ルーティングの入口。features を遅延読み込み
    core/                    アプリ全体で 1 つだけ存在する関心事
      http/
        api-base-url.interceptor.ts
        api-error.ts
    shared/                  どの feature からも使える、状態を持たない部品
      models/request-status.ts
      ui/spinner/
      ui/error-banner/
    features/
      products/
        products.routes.ts   この feature のルート定義 + state/effects/DI の登録
        product-category.labels.ts
        data-access/         API との境界
          product.dto.ts     API のレスポンス形（snake_case）
          product.model.ts   アプリ内のドメイン型（camelCase）
          product.mapper.ts  DTO → ドメイン型の変換
          products.api.ts    HttpClient を叩く唯一の場所
        store/
          products.actions.ts
          products.reducer.ts
          products.selectors.ts
          products.effects.ts
        pages/               ルートに紐づく smart component
          product-list-page/
          product-detail-page/
        components/          feature 内の presentational component
          product-table/
```

依存の向きは **features → shared / core** の一方向。
`shared` や `core` が `features` を import していたら設計が壊れている。

## 02 から変えた点

### 1. state を遅延登録する

02 はルートの `provideStore({ toggle, color })` で全 feature の reducer を登録していた。
これは feature が 50 個になると、起動時に 50 個分の reducer と初期 state を必ず読むことになる。

03 ではルートは空:

```ts
provideStore({}, { runtimeChecks: { ... } })
```

state と effects は、その feature のルートで登録する（`products.routes.ts`）:

```ts
providers: [provideState(productsFeature), provideEffects(productsEffects), ProductsApi]
```

`/products` に入るまで products の reducer・effect・API サービスはバンドルごと読み込まれない。
ビルドログの `products-routes` / `product-list-page` / `product-detail-page` が分割された chunk。

### 2. API の形とアプリ内の型を分ける

`data-access/` に DTO・ドメイン型・mapper を置き、API のレスポンス形が
reducer や component に一切漏れないようにしている。

- API が `product_name` を `name` に変えても、直すのは `product.mapper.ts` だけ
- `category_code` は文字列だが、ドメイン側は `'kitchen' | 'audio' | 'furniture' | 'unknown'` の union
  → 未知の値は mapper で `'unknown'` に倒すので、それ以降のコードは想定外の文字列を考えなくていい

### 3. @ngrx/entity でコレクションを持つ

`createEntityAdapter` で `{ ids, entities }` の正規化された形を使う。
配列を直接 state に置くと、1 件更新のたびに `products.map(p => p.id === id ? ... : p)` を書くことになる。

`sortComparer` を渡してあるので `ids` は常に名前順。並び替えを component 側でやらなくて済む。

### 4. アクションは「発生源」ごとに分ける

```
ProductListPageActions     商品一覧画面で起きたこと
ProductDetailPageActions   商品詳細画面で起きたこと
ProductsApiActions         API から返ってきたこと
```

命令（`loadProducts`）ではなく**出来事**（`opened`, `refreshClicked`, `loadProductsSucceeded`）を名前にする。
1 つの出来事に複数の reducer / effect が反応できるようになり、DevTools のログが
「誰が何をしたか」の履歴としてそのまま読める。

### 5. 非同期の状態を 1 個にまとめない

products feature には一覧と詳細の 2 つの通信がある。`status` を 1 つで共用すると、
詳細を読み込んでいる間に一覧までスピナーになる。

```ts
listStatus / listError
detailStatus / detailError
```

`RequestStatus` は `shared/models/` に置いた union（`'idle' | 'loading' | 'success' | 'error'`）。
boolean の `isLoading` にしないのは、「読み込み前」と「読み込んで 0 件」を区別するため。

### 6. Effect で必ず catchError する

```ts
switchMap(() =>
  productsApi.loadProducts().pipe(
    map(...),
    catchError(...),   // ← 内側の pipe に置く
  ),
)
```

`catchError` を `actions$.pipe()` の直下（外側）に置くと、1 回エラーが起きた時点で
**その effect のストリームごと完了し、以降アクションを一切拾わなくなる**。
画面上は「一度失敗したらボタンが無反応になる」という形で出る。内側に置けば失敗は 1 回の通信で閉じる。

`switchMap` を選んでいるのは、再読み込みを連打したとき古いリクエストの結果を捨てたいから。
02 の `concatMap` は「全部順番に実行する」ので、送信系（重複実行させたくない）は `exhaustMap` を使う。

### 7. smart / presentational を分ける

- `pages/` … `Store` を注入し、dispatch と selectSignal を担当する
- `components/` … `input()` だけ受け取る。`Store` を知らない

`ProductTable` は商品配列を受け取って表を描くだけなので、別の画面や Storybook にそのまま置ける。
`shared/ui/` の `Spinner` / `ErrorBanner` も同じ理由で状態を持たせていない。

### 8. selectors を別ファイルにする

02 は `createFeature` の `extraSelectors` に閉じていたが、派生 selector が増えると
reducer ファイルが「state 定義 + 遷移 + 読み出し」を全部抱えて肥大化する。
03 は `products.selectors.ts` に分離し、`ProductsSelectors` 経由でのみ公開している。

`selectFilteredProducts` のように、entity の一覧とフィルタ条件を合成する処理は
component ではなく selector に置く（メモ化が効き、複数画面から再利用できる）。

### 9. パスエイリアス

`@core/*` `@shared/*` `@features/*` `@env/*` を `tsconfig.json` に定義。
`../../../core/services/xxx` のような相対パスはファイル移動で全滅するうえ、
レビューで層をまたいだ参照に気付けない。

### 10. 設定値を environment に出す

`apiBaseUrl` をコードに直書きせず `src/environments/` に置き、
`angular.json` の `fileReplacements` で development ビルド時に差し替える。
本番の値を既定にしてあるので、差し替え設定を消しても開発用の値が本番に出ることはない。

### 11. 起動時のガード

- `runtimeChecks` … state / action を凍結し、うっかり直接書き換えたら開発中に即エラー
- `provideStoreDevtools` … `environment.production` で本番バンドルから丸ごと外す
- `tsconfig` … `strict` / `noUnusedLocals` / `strictTemplates` を最初から全部有効化

`strictTemplates` が無いと `*.html` の中だけ型チェックが効かず、そこがバグの温床になる。

## 動かして確認できること

| やること | 見えるもの |
|---|---|
| `/products` を開く | `[Product List Page] Opened` → `[Products API] Load Products Succeeded` |
| カテゴリを絞る | 通信は走らず selector だけが再計算される |
| `/products/p-999` を開く | 404 → `[Products API] Load Product Failed` → エラー表示 |
| DevTools の state を見る | `products` は `/products` に入った瞬間に現れる（遅延登録） |

## 意図的に入れていないもの

- **Facade サービス** … store を隠す層。NgRx 側は非推奨寄りの立場で、
  間接層が 1 枚増える割に得るものが少ない。component が直接 `Store` を触る形で十分
- **@ngrx/router-store** … 詳細画面の `:id` は `withComponentInputBinding()` で
  `input.required()` に流している。ルーター情報を state として selector で合成したくなったら導入する
- **テスト** … reducer / selector は純粋関数なので本来は最初に書く対象。
  このサンプルは構成の学習が目的なので省いている
