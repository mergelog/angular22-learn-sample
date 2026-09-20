# Angular: Router 以外の脇役便利機能

対象: Angular 22 のスタンドアロンコンポーネント構成。

画面を組み立てるときに、頻出するものの主役になりにくい便利機能をまとめる。

| 分類 | 機能 | 主な用途 | 最小例 | 補足 |
| --- | --- | --- | --- | --- |
| Pipe | `date` | 日付・時刻を表示用に整形する | `{{ createdAt \| date:'yyyy/MM/dd' }}` | 表示だけを変換し、元データは変更しない。 |
| Pipe | `number` / `percent` / `currency` | 数値・割合・通貨を整形する | `{{ price \| currency:'JPY' }}` | 桁区切りや通貨記号をテンプレートへ直書きしなくてよい。 |
| Pipe | `uppercase` / `lowercase` / `titlecase` | 文字列の大文字・小文字・単語先頭を整形する | `{{ name \| uppercase }}` | UI表示だけを変えたい場合に使う。 |
| Pipe | `json` | オブジェクトを JSON 表示する | `{{ state \| json }}` | 開発時の状態確認に便利。本番UIでの常用は避ける。 |
| Pipe | `AsyncPipe` | `Observable` / `Promise` の値を表示する | `{{ user$ \| async }}` | 手動の `subscribe()` と解除処理を減らせる。 |
| テンプレート | `@if` | 条件によって表示を切り替える | `@if (isLoading()) { ... }` | 旧来の `*ngIf` に相当する組み込み制御構文。 |
| テンプレート | `@for` | 配列を繰り返し表示する | `@for (item of items(); track item.id) { ... }` | `track` を指定し、DOMの不要な作り直しを防ぐ。 |
| テンプレート | `@switch` | 値ごとに表示を分岐する | `@switch (status()) { @case ('done') { ... } }` | 状態表示が3種類以上あるときに読みやすい。 |
| テンプレート | `@defer` | 重いUIを必要になるまで遅延表示する | `@defer { <app-chart /> }` | グラフ、モーダル、画面下部などの初期表示を軽くできる。 |
| バインディング | `[class.xxx]` | 条件によりCSSクラスを付ける | `[class.active]="isActive()"` | 単純なクラス切替では `ngClass` より簡潔。 |
| バインディング | `[style.xxx]` | 条件によりインラインスタイルを変える | `[style.color]="isError() ? 'red' : null"` | 状態と色などを直接対応付けるときに使う。複雑な装飾はCSSクラスへ寄せる。 |
| バインディング | `[attr.xxx]` | HTML属性を設定・削除する | `[attr.aria-pressed]="isOn()"` | ARIA属性、`colspan` のような属性を扱うときに有用。 |
| バインディング | プロパティバインディング | DOMプロパティへ値を渡す | `[disabled]="isSaving()"` | 属性文字列ではなく、booleanなど適切な型で設定できる。 |
| テンプレート | `ng-container` | DOM要素を追加せずにテンプレートをまとめる | `<ng-container>...</ng-container>` | レイアウトを崩さずに構造ディレクティブなどを適用できる。 |
| テンプレート | `ng-template` | 再利用・差し替え用のテンプレートを定義する | `<ng-template #empty>データなし</ng-template>` | 空状態、ローディング、カスタムセルなどで使う。 |
| コンポーネント通信 | `input()` | 親から子へ値を渡す | `name = input.required<string>();` | Signalベースの入力API。子の依存する値を明確にする。 |
| コンポーネント通信 | `output()` | 子から親へイベントを通知する | `saved = output<User>();` | 親は `(saved)="onSaved($event)"` として受け取る。 |
| コンポーネント通信 | `model()` | 双方向の状態連携を定義する | `checked = model(false);` | カスタムフォーム部品などで `[(checked)]` を提供できる。 |
| Signal | `computed()` | 他のSignalから表示用の値を作る | `fullName = computed(() => ...)` | 派生値に使う。テンプレートで複雑な式を書かない。 |
| Signal | `effect()` | Signal変化に伴う副作用を実行する | `effect(() => localStorage.setItem(...))` | API呼出や状態の導出には使わず、DOM・ログ・ストレージ連携などに限定する。 |
| DI | `inject()` | サービスを注入する | `private readonly store = inject(Store);` | コンストラクタを省略でき、関数型APIでも利用できる。 |
| 子・要素参照 | `viewChild()` | 子コンポーネント・DOM要素を参照する | `input = viewChild<ElementRef>('input');` | フォーカス制御や外部ライブラリ連携に使う。通常のデータ連携には `input` / `output` を優先する。 |
| 変更検知 | `ChangeDetectionStrategy.OnPush` | 必要なときに絞って更新する | `changeDetection: ChangeDetectionStrategy.OnPush` | Signal、`input()`、イベントと相性がよい。状態を不変に扱う。 |

## 使い分けの目安

| したいこと | まず使うもの |
| --- | --- |
| 日付・金額・割合を表示だけ整形したい | 組み込み Pipe |
| Observableを画面へ出したい | `AsyncPipe` |
| 条件表示やリスト表示をしたい | `@if` / `@for` |
| 状態に応じて見た目を変えたい | `[class.xxx]` / `[attr.xxx]` |
| 親子で値・イベントを受け渡したい | `input()` / `output()` |
| Signalから表示用の値を計算したい | `computed()` |
| DOM要素を直接操作する必要がある | `viewChild()` |

## 注意点

- Pipe は表示の整形に使い、ドメインロジックや副作用は入れない。
- `effect()` は状態の同期手段にしすぎず、派生値には `computed()` を優先する。
- `viewChild()` による直接DOM操作は必要最小限にし、通常の親子連携には `input()` と `output()` を使う。
- `@for` では、安定したIDを `track` に指定する。
