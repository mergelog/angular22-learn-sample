# Angular Router: 脇役だが便利な機能

対象: Angular 22 のスタンドアロンコンポーネント構成。

`RouterLinkActive` のように、ルーティングを使う際に一緒に知っておくと実装量を減らせる機能をまとめる。

| 機能 | 主な用途 | 最小例 | 補足 |
| --- | --- | --- | --- |
| `RouterLink` | ページ遷移用リンクを作る | `<a routerLink="/dashboard">dashboard</a>` | `<a href>` と異なり、SPA 内の遷移ではページ全体を再読込しない。 |
| 相対 `RouterLink` | 現在のルートを基準にリンクを書く | `<a routerLink="canvas">canvas</a>` | 親ルートのコンポーネント内なら、`/p00-ngrx/canvas` のような絶対パスを繰り返さずに済む。 |
| `RouterLinkActive` | 現在開いているリンクにクラスを付ける | `<a routerLink="/canvas" routerLinkActive="active">canvas</a>` | `active` クラスを CSS で装飾し、選択中の項目を示す。 |
| `routerLinkActiveOptions` | アクティブ判定を完全一致にする | `[routerLinkActiveOptions]="{ exact: true }"` | 既定では子URLもアクティブ扱いになる。親メニューだけを強調したい場合は既定、個別タブなら完全一致が便利。 |
| `ariaCurrentWhenActive` | 選択中リンクを支援技術にも伝える | `ariaCurrentWhenActive="page"` | `RouterLinkActive` と併用する。見た目だけでなくアクセシビリティも改善する。 |
| `queryParams` | クエリ文字列を付けて遷移する | `[queryParams]="{ page: 2 }"` | `/projects?page=2` のような一覧のページ番号・絞り込み条件に使う。 |
| `queryParamsHandling` | 既存クエリを維持または結合する | `queryParamsHandling="merge"` | タブ遷移時に、既存の検索条件などを残したいときに使う。 |
| `fragment` | URL の `#` を指定する | `fragment="details"` | 見出しなどへ遷移するアンカーリンクを作れる。 |
| `Router.navigate` / `navigateByUrl` | TypeScript から遷移する | `this.router.navigate(['/projects', id])` | 保存成功後、削除後、ボタン押下などテンプレート以外から遷移するときに使う。 |
| `ActivatedRoute` | パス引数・クエリ・ルート設定を読む | `inject(ActivatedRoute).paramMap` | `/projects/:id` の `id`、`queryParamMap`、`data`、`title` などをコンポーネント側で取得できる。 |
| `data` | ルート固有の静的メタデータを置く | `data: { feature: 'p00-ngrx' }` | 権限名、パンくず、分析ID、画面種別などをルート定義へ集約できる。 |
| `title` | ブラウザタブのタイトルを設定する | `title: 'Canvas'` | Angular がルート有効化時に `document.title` を更新する。 |
| `redirectTo` + `pathMatch` | 既定URL・旧URLを別URLへ送る | `{ path: '', pathMatch: 'full', redirectTo: 'novice' }` | 空パスの既定遷移では、通常 `pathMatch: 'full'` を指定する。 |
| `**` ワイルドカード | 未定義URLの受け皿を作る | `{ path: '**', redirectTo: 'dashboard' }` | ルート配列の最後に置く。先に置くと後続ルートへ到達できない。 |
| 子ルート + `RouterOutlet` | 共通枠を残して一部分だけ切り替える | `children: [...]` と `<router-outlet />` | 共通ヘッダー・サイドバー・パンくずを親に一度だけ置く構成で使う。 |
| `canActivate` / `canDeactivate` / `canMatch` | 遷移前の条件判定を行う | `canActivate: [authGuard]` | 認証、未保存変更の確認、機能フラグでのルート選択に使う。認可の最終判定は必ずサーバー側でも行う。 |
| `resolve` / `ResolveFn` | 表示前に必要データを用意する | `resolve: { project: projectResolver }` | 初期表示に必須のデータがあり、空表示を避けたいときに使う。 |
| ルート `providers` | 特定ルート配下だけに DI を提供する | `providers: [provideState(feature)]` | NgRx の feature state や画面限定サービスを、そのルートのライフサイクルへ閉じ込められる。 |
| `loadComponent` / `loadChildren` | 画面や機能を遅延ロードする | `loadComponent: () => import('./canvas/...')` | 最初に読み込む JavaScript を小さくし、必要な画面を開いた時点で読み込む。 |

## 現在の `p00-ngrx` のナビ例

```html
<a routerLink="/p00-ngrx/canvas" routerLinkActive="active" ariaCurrentWhenActive="page">
  canvas
</a>
```

```scss
.active {
  font-weight: 700;
}
```

## 使い分けの目安

| したいこと | まず使うもの |
| --- | --- |
| テンプレート内で画面遷移したい | `RouterLink` |
| 選択中のメニューを装飾したい | `RouterLinkActive` |
| URLの `id` や検索条件を読みたい | `ActivatedRoute` |
| 保存後など TypeScript から遷移したい | `Router.navigate` |
| 共通ヘッダーを残して子画面だけ切り替えたい | 子ルート + `RouterOutlet` |
| ログインや未保存状態を確認してから遷移したい | Route Guard |
| 画面表示前に必須データを取得したい | Resolver |

## 公式資料

- [Angular Routing overview](https://angular.dev/guide/routing)
- [Router reference](https://angular.dev/guide/routing/router-reference)
- [Read route state / RouterLinkActive](https://angular.dev/guide/routing/read-route-state)
- [Define routes](https://angular.dev/guide/routing/define-routes)
- [Show routes with outlets](https://angular.dev/guide/routing/show-routes-with-outlets)
- [Control route access with guards](https://angular.dev/guide/routing/route-guards)
- [Route data resolvers](https://angular.dev/guide/routing/data-resolvers)
