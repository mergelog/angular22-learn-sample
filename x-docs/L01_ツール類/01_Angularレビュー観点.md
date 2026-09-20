# Angular実装レビュー観点

## まとめ

| 項目 | 方針 |
| --- | --- |
| 採用する分類 | 網羅性と検索性を優先し、統合版21観点ではなく**23観点**に分ける |
| 最重要の読み順 | コンポーネントツリー → 状態管理 → API → DI/Service → コンポーネント間通信 → リアクティブ処理 → Routing → 型設計 |
| レビュー単位 | ファイル単体ではなく、原則として「1画面」または「1ユーザー操作」を入口にする |
| 中心となる問い | 誰が表示し、誰が状態を所有し、変更がどこを通ってAPIへ届き、結果がどう画面へ戻るか |
| 判定方法 | コード、設定、テスト、実行時挙動を根拠にし、命名やディレクトリだけで責務を断定しない |
| このリポジトリの前提 | Angular 22.1、NgRx 22、RxJS 7.8。従来型NgRx Store/EffectsとSignal Storeが併存する |
| 資料の用途 | コードリーディングの索引、変更レビューのチェックリスト、調査結果の記録基準 |

## 1. この資料の目的

Angular実装を、思いついた順に確認するのではなく、同じ切り口と粒度で追跡できるようにする。

この資料は次の両方に使用する。

- 既存画面の仕組みを理解するコードリーディング
- 新規実装・変更実装が既存設計と整合しているかを確認するレビュー

ここにあるチェック項目は「すべての実装で、すべての技術を使うべき」という意味ではない。該当しない項目は「対象外」とし、なぜ対象外なのかを短く記録する。

## 2. 結論：23観点に分ける

実装を漏れなく検索し、指摘を分類しやすくするため、次の23観点を正式な分類とする。

| # | 実装観点 | 主に答える問い |
| ---: | --- | --- |
| 1 | コンポーネントツリー | 誰が誰を表示・所有するか |
| 2 | 状態管理 | データの正本を誰が保持し、誰が更新するか |
| 3 | ルーティング・画面遷移 | URLから画面へどう到達し、遷移条件を誰が決めるか |
| 4 | API・データアクセス | データをどこから、どの契約で取得・更新するか |
| 5 | ドメインモデル・型設計 | API、業務概念、画面表示用データをどう分離するか |
| 6 | DI・Service設計 | 責務をどのServiceへ置き、どのスコープで注入するか |
| 7 | コンポーネント間通信 | 親子・兄弟・遠隔コンポーネント間で何を渡すか |
| 8 | リアクティブ処理・非同期制御 | 変更がどの順序で伝播し、競合をどう制御するか |
| 9 | フォーム・入力値管理 | 編集中の値、検証、送信状態を誰が管理するか |
| 10 | テンプレート・レンダリング設計 | 状態をどのDOMへ、どの条件で描画するか |
| 11 | 共通部品・再利用設計 | 何を共通化し、どこまで利用側に委ねるか |
| 12 | Feature境界・依存関係 | Feature間の依存方向と公開境界が守られているか |
| 13 | エラー・例外処理 | 失敗をどこで分類し、回復・通知するか |
| 14 | 認証・認可・権限制御 | 誰が何を閲覧・操作できるかをどこで保証するか |
| 15 | ライフサイクル・リソース管理 | 生成した購読・Effect・リスナー等をどう終了するか |
| 16 | キャッシュ・データ同期 | サーバー状態とクライアント状態をどう一致させるか |
| 17 | パフォーマンス・変更検知 | 必要な処理・描画だけを実行できているか |
| 18 | スタイル・レイアウト | 見た目の責務、スコープ、レスポンシブ対応が適切か |
| 19 | アクセシビリティ | キーボード、支援技術、視認性で操作できるか |
| 20 | テスト設計 | 重要な振る舞いを適切なテスト境界で保証しているか |
| 21 | ログ・デバッグ容易性 | 障害時に何が起きたか追跡できるか |
| 22 | 設定・環境依存 | 環境差、機能フラグ、外部値を安全に切り替えられるか |
| 23 | セキュリティ実装 | 信頼境界を越える値と操作を安全に扱っているか |

## 3. 似ている観点の分離基準

### 3.1 画面構造に関する4観点

```text
コンポーネントツリー
  └─ 誰が誰を持つか

コンポーネント間通信
  └─ その間で何を渡すか

状態管理
  └─ 渡されるデータの正本を誰が管理するか

リアクティブ処理
  └─ 正本の変更がいつ、どの順序で伝播するか
```

たとえば親から子へ`input()`で一覧を渡している場合、親子関係は「コンポーネントツリー」、渡す値とイベントは「コンポーネント間通信」、一覧の正本がStoreなら「状態管理」、一覧更新を`switchMap`で再取得する部分は「リアクティブ処理」として記録する。

### 3.2 データに関する3観点

| 観点 | 境界 | 代表例 |
| --- | --- | --- |
| API・データアクセス | データを外部から取得・更新する境界 | `HttpClient`、API Service、DTO、interceptor |
| 状態管理 | 取得後のデータをアプリ内で保持・更新する境界 | reducer、selector、Signal Store、component state |
| キャッシュ・データ同期 | 保持した値の鮮度とサーバーとの一致を保つ境界 | invalidation、再取得、楽観更新、重複排除 |

同じコードが複数観点に該当してもよい。ただし指摘理由は分ける。たとえば「更新API成功後に一覧が古い」はAPI呼び出し自体ではなく、同期・無効化の問題である。

### 3.3 開始と終了に関する2観点

| 観点 | 確認対象 |
| --- | --- |
| リアクティブ処理・非同期制御 | ObservableやSignalが、何を契機に開始・変換・合流・取消するか |
| ライフサイクル・リソース管理 | 購読、Effect、timer、DOM listener、外部資源がいつ終了・解放されるか |

### 3.4 DIと通信の境界

Serviceの注入経路、providerの配置、インスタンスの寿命は「DI・Service設計」で確認する。そのServiceを利用して複数コンポーネント間に値やイベントを伝える仕組みは「コンポーネント間通信」でも確認する。

## 4. レビューの基本ルール

### 4.1 根拠の強さを区別する

| 区分 | 意味 | 記載例 |
| --- | --- | --- |
| 確認済み | コード、設定、テスト、実行結果で確認した | 「`loadChildren`により遅延ロードされる」 |
| 推測 | 複数の根拠から合理的に考えられるが未確認 | 「命名と利用箇所からFacade相当と推測」 |
| 不明 | 必要な根拠がない、または挙動を再現できない | 「キャッシュの失効条件は不明」 |
| 対象外 | 対象機能には存在しない | 「編集フォームがないためCVAは対象外」 |

ディレクトリ名、クラス名、メソッド名だけで責務を確定しない。依存元、呼び出し元、状態更新、テストまで確認する。

### 4.2 まず1本の縦経路を完成させる

最初から全ファイルを分類せず、代表的なユーザー操作を1つ選び、次の経路を最後まで追う。

```text
URL
  → Route
  → Page/Container
  → UI Component
  → input / output / handler
  → action / store method / facade
  → EffectまたはService
  → API Service / HttpClient
  → backend response
  → reducer / signal update
  → selector / computed
  → template再描画
```

その後、失敗経路、再読込、権限差、破棄、テストへ広げる。この順序なら、個別技術を見つけただけで全体を理解したと誤認しにくい。

### 4.3 指摘の優先度

| 優先度 | 基準 | 例 |
| --- | --- | --- |
| Critical | 情報漏えい、権限突破、データ破壊、重大障害につながる | クライアントGuardだけで認可、未検証HTMLを信頼扱い |
| High | 主要操作の誤動作、競合、永続的な不整合につながる | 古いレスポンスで新しい検索結果を上書き |
| Medium | 保守性、性能、回復性を継続的に損なう | Feature境界違反、重複API、購読解除漏れ |
| Low | 可読性、一貫性、局所的改善 | 命名の不統一、冗長なテンプレート式 |

「ベストプラクティスと違う」だけでは指摘にしない。現在または将来の具体的な故障モード、影響範囲、再現条件を示す。

## 5. 優先順位

### 最優先：1本の操作経路を理解する8観点

1. コンポーネントツリー
2. 状態管理
3. API・データアクセス
4. DI・Service設計
5. コンポーネント間通信
6. リアクティブ処理・非同期制御
7. ルーティング・画面遷移
8. ドメインモデル・型設計

### 次点：正しさと運用を保証する観点

- フォーム、エラー、認証・認可、ライフサイクル、キャッシュ
- テスト、ログ、設定、セキュリティ

### 最後に横断確認する観点

- テンプレート、共通化、Feature境界、パフォーマンス
- スタイル、アクセシビリティ

スタイルやアクセシビリティの重要度が低いという意味ではない。データ経路とは調査方法が異なるため、縦経路を把握した後に専門観点として横断確認する。

## 6. 23観点の詳細

### 6.1 コンポーネントツリー

**目的:** 画面を構成する部品の所有関係と、Page/Container/Presentational UIの責務を明らかにする。

**主な確認箇所:** Routeの`component`/`loadComponent`、`router-outlet`、各templateのselector、動的Component、dialog/overlay/portal、content projection。

**チェック項目:**

- URLの入口から主要操作部品まで、親子経路を欠落なく辿れるか。
- Route配下だけでなく、dialog、menu、overlay、portalなどDOM上の見え方と所有者が異なる部品も含めたか。
- 親がデータ取得・状態調停を担い、表示専用の子が不必要にStoreやAPIへ直接依存していないか。
- 巨大Componentが、画面調停・API・整形・表示・イベント処理を同時に持っていないか。
- 同じ子Componentの複数配置、再帰構造、動的生成がある場合、インスタンスごとの状態を区別できているか。
- `viewChild`/`contentChild`による直接操作が、暗黙の親子結合を作っていないか。

**境界:** 値の受け渡し方は観点7、値の所有者は観点2で扱う。

**成果物:** selectorとクラス名を併記したツリー。動的部品には「誰が、何を契機に生成するか」を注記する。

### 6.2 状態管理

**目的:** 状態の正本、更新権限、スコープ、導出値を特定する。

**主な確認箇所:** NgRx action/reducer/selector/effect、Signal Store、`signal`/`computed`、Service内Subject、Component field、router state、form state。

**チェック項目:**

- 各状態を「サーバー状態」「URL状態」「共有UI状態」「Feature状態」「Componentローカル状態」「フォーム編集中状態」に分類したか。
- 同じ意味の値がStore、Service、Componentに重複し、どれが正本か曖昧になっていないか。
- NgRxではaction → reducer → selectorの更新経路と、Effectが担う副作用を区別できているか。
- Signal Storeではstate、computed、method、hookの責務が混ざっていないか。
- 保存可能な元状態と、`selector`/`computed`で導出すべき値を重複保持していないか。
- 複数Featureが更新できる共有状態について、更新規則と所有Featureが明確か。
- Route paramやquery paramとStoreの二重管理に、同期規則があるか。
- loading/error/empty/permission deniedを同じ「データなし」で表していないか。
- entityの識別子、並び順、選択状態が更新後も一貫するか。

**ClearMLでの注意:** 従来型NgRx Store/Effectsと`@ngrx/signals`が併存する。新旧という理由だけで優劣を決めず、状態スコープ、既存Featureとの整合、更新主体で判断する。Effectsは更新対象stateのFeature配下に置くプロジェクト方針も確認する。

**成果物:** 状態一覧表。最低限「状態名・型・正本・初期化・更新者・読取者・寿命」を記録する。

### 6.3 ルーティング・画面遷移

**目的:** URLと画面、遷移条件、Route固有DIスコープ、初期データ取得の関係を明らかにする。

**主な確認箇所:** `*.routes.ts`、`loadChildren`、`loadComponent`、children、redirect、guard、resolver、Route providers、`ActivatedRoute`、router-store。

**チェック項目:**

- 静的path、path param、query param、fragmentの意味と型変換が明確か。
- `pathMatch`、空path、redirect、wildcardの順序による誤マッチがないか。
- Feature単位でlazy loadされ、不要な初期bundle依存が入っていないか。
- guardが認証・認可の唯一の防壁になっていないか。サーバー側でも必ず検証されるか。
- redirect時は`false`と命令的`navigate()`の組合せではなく、`UrlTree`等で遷移結果を返せるか。
- resolverは初期描画に必須のデータだけか。遅延、失敗、取消時のUXがあるか。
- param/queryParam変更時に、Component再利用と再取得条件が合っているか。
- `runGuardsAndResolvers`の条件が期待する再実行条件と一致するか。
- browser back/forward、deep link、refresh、存在しないIDでも状態が破綻しないか。
- Route-level providersで意図せずService/Storeの別インスタンスが作られていないか。

**成果物:** Route表。「URL・Component・lazy境界・guard・resolver・provider・param・遷移元/先」を記録する。

### 6.4 API・データアクセス

**目的:** UIから外部データ源までの契約、変換、取消、共通処理を確認する。

**主な確認箇所:** `HttpClient`、API Service、generated client、interceptor、request/response DTO、query作成、upload/download、polling。

**チェック項目:**

- Componentが直接HTTP詳細を組み立てず、API境界がService等に集約されているか。
- endpoint、HTTP method、query/body/header、response型がbackend契約と一致するか。
- DTOをそのまま画面全域へ流さず、必要ならdomain/ViewModelへ明示変換しているか。
- `any`、過剰なtype assertion、存在しない値の非null assertionで契約不整合を隠していないか。
- 検索条件、ページング、ソート、timezone、単位、null/undefinedの送信規則が正しいか。
- interceptorの認証、base URL、エラー変換、retryが個別Serviceと二重化していないか。
- 連続検索や画面離脱時に不要リクエストを取消できるか。
- retryして安全なのは冪等操作か。更新APIを無条件再送して重複更新しないか。
- upload/download、大きなresponse、stream、進捗表示をメモリへ一括保持して問題ないか。
- API成功のHTTP statusだけでなく、業務エラー形式も判定しているか。

**境界:** response取得後の保持は観点2、鮮度維持は観点16、エラー表示は観点13で扱う。

**成果物:** 主要操作ごとのAPI契約表と、DTO → domain → ViewModelの変換図。

### 6.5 ドメインモデル・型設計

**目的:** 外部契約、業務概念、画面都合の型を分離し、不正状態を作りにくくする。

**主な確認箇所:** `interface`、`type`、class、enum/union、DTO、selector戻り値、form value、table row型。

**チェック項目:**

- API DTO、domain model、ViewModel、form modelの役割が区別されているか。
- 同名に近い型が複製され、項目追加時に片方だけ更新される構造になっていないか。
- statusや種別を自由な`string`ではなく、既知のunion等で表現できるか。
- nullable、optional、未取得、権限非表示を同じ`undefined`へ押し込めていないか。
- ID、時刻、期間、byte、percentage等、意味や単位の違う値を混同しないか。
- APIのsnake_case等をどの境界で変換するか一貫しているか。
- discriminated unionで状態別に必要項目を保証できるか。
- 型だけで実行時入力の安全性が保証されたと誤認していないか。外部入力の検証境界があるか。
- mutableな参照共有により、reducer外や意図しない場所で状態が変化しないか。

**成果物:** 主要モデルの役割表。似た型には「変換元・変換先・変換関数」を記録する。

### 6.6 DI・Service設計

**目的:** Serviceの責務、依存方向、インスタンスのスコープと寿命を明らかにする。

**主な確認箇所:** `inject()`、constructor injection、`providedIn`、ApplicationConfig providers、Route providers、Component providers、`InjectionToken`、Facade、Repository/API Service。

**代表的な経路:** 

```text
Component → Facade → Store / API Service → HttpClient
Component → Store → Effect → API Service → HttpClient
Component → API Service → HttpClient
```

どの形も常に正解・不正解ではない。画面の複雑さ、状態共有、テスト境界、既存Featureの設計と合っているかで判断する。

**チェック項目:**

- Service名だけでなく、公開メソッド、保持状態、副作用、依存先から実際の責務を確認したか。
- API通信、状態保持、画面通知、値変換を1つの巨大Serviceに集めていないか。
- `providedIn: 'root'`により、本来Feature限定の可変状態がアプリ全体で共有されていないか。
- Route/Component providersが意図した分離か、偶発的な複数インスタンス化か。
- `InjectionToken`に型があり、環境値や実装差し替えの境界が明確か。
- Componentが低水準Serviceを多数injectし、調停ロジックを抱えていないか。
- Facadeが単なる全メソッド転送層になっていないか。隠すべき複雑性があるか。
- 循環依存や、下位層からFeature/UI層への逆依存がないか。
- Service内のObservable/Signalが、読取専用公開と更新用APIに分離されているか。
- テスト時の差し替えや、SSR/worker/browser API差をDIで扱えるか。

**成果物:** DI経路図とService責務表。「provider位置・スコープ・保持状態・依存先・利用Feature」を記録する。

### 6.7 コンポーネント間通信

**目的:** 親子・兄弟・離れたComponent間のデータとイベントの契約を確認する。

**主な確認箇所:** `input()`/`@Input`、`output()`/`@Output`、`model()`、template reference、query、Service、Store、router state、dialog data/result。

**チェック項目:**

- inputは子が表示・判断する最小限の値か。巨大な親Component自体を渡していないか。
- outputは「保存せよ」のような親の実装命令ではなく、「保存が要求された」等の出来事を表すか。
- 双方向bindingが値の所有者を曖昧にしていないか。
- 子がinput objectを直接変更して親状態を暗黙に変えていないか。
- 同じイベントがoutput、Service、Store actionで重複通知されないか。
- 兄弟間通信のためだけに親を通すべきか、Feature Store/Serviceへ上げるべきか、寿命と共有範囲で判断したか。
- dialog/overlayの入力データと終了結果が型付けされ、取消と確定を区別するか。
- queryによる子の直接操作が、公開APIとして明示され、描画タイミングに依存しすぎていないか。
- output後に親が処理し、更新されたinputが戻る一方向の流れを追えるか。

**成果物:** Component間ごとに「送信元・受信先・手段・データ型・契機・所有者」を記録する。

### 6.8 リアクティブ処理・非同期制御

**目的:** Signal、Observable、Effectのデータフロー、順序、取消、重複実行を確認する。

**主な確認箇所:** `signal`、`computed`、`effect`、`resource`/`httpResource`、RxJS operator、NgRx Effects、Signal Store methods/hooks、Observable-Signal相互変換。

**チェック項目:**

- source → transformation → side effect → state updateの流れを図示できるか。
- `computed`は純粋な導出か。API呼び出しや状態更新を含んでいないか。
- `effect`を、本来`computed`で表せる状態同期に乱用していないか。
- `switchMap`、`concatMap`、`exhaustMap`、`mergeMap`の選択が業務上の同時実行規則と一致するか。
- 検索は古い要求を取消す、保存は順序を守る、二重送信は無視する等、操作ごとの規則が明確か。
- `combineLatest`等が全sourceの初回emit待ちになり、画面が永遠にloadingにならないか。
- `shareReplay`やSubjectが古い値、エラー、購読を意図せず保持しないか。
- SignalとObservableの相互変換を何層も往復し、更新契機が追いにくくなっていないか。
- Effectが同じactionを循環発火しないか。dispatchしないEffectが明示されているか。
- 非同期完了順が逆転しても、古いresponseが最新状態を上書きしないか。
- loading/error/finalizeが取消時にも正しく戻るか。

**境界:** 終了・解放は観点15、状態の正本は観点2で扱う。

**成果物:** 主要フローの時系列図。operatorを列挙するだけでなく「なぜその同時実行規則か」を書く。

### 6.9 フォーム・入力値管理

**目的:** 編集中の値、検証、UI状態、送信値変換を一貫して管理する。

**主な確認箇所:** Reactive Forms、typed forms、FormGroup/FormArray/FormRecord、validator、async validator、CVA、Signal Formsを使用している場合はそのschema/control。

**チェック項目:**

- form modelが入力値の正本になっているか。Component fieldとの二重管理がないか。
- `nonNullable`を含め、controlの型と実際の初期値・reset値が一致するか。
- `setValue`/`patchValue`の使い分けで、項目欠落を隠していないか。
- disabled controlが`value`から除外されることを考慮して送信値を作っているか。
- sync/async/cross-field validatorが適切なcontrol階層にあるか。
- async validationやautocompleteで、古い結果の取消とloading表示があるか。
- `dirty`、`touched`、`submitted`のどの条件でエラー表示するか一貫しているか。
- API値 → form値 → request DTOの変換が明示されているか。
- 保存中の二重送信、離脱時の未保存警告、成功後のdirty resetを扱っているか。
- CVAは`writeValue`、`registerOnChange`、`registerOnTouched`、disabled状態を正しく橋渡しするか。
- `valueChanges`を購読する場合、初期化時の`emitEvent`と循環更新を考慮しているか。

**成果物:** form control表。「型・初期値・validator・表示条件・送信先項目」を記録する。

### 6.10 テンプレート・レンダリング設計

**目的:** 状態からDOMへの変換が読みやすく、予測可能で、安全かを確認する。

**主な確認箇所:** `@if`、`@for`、`@switch`、`@defer`、binding、pipe、`ng-template`、`ng-content`、dynamic template、class/style binding。

**チェック項目:**

- loading/error/empty/content/permission deniedの表示条件が排他的か。
- 複雑な計算や副作用のあるメソッドをtemplateから繰り返し呼んでいないか。
- `@for`の`track`が安定した一意IDか。index追跡で並べ替え時にDOM状態を誤再利用しないか。
- `@defer`のtrigger、placeholder、loading、errorが実際のUXとbundle分割目的に合うか。
- `ng-template`やprojectionの暗黙contextが型・命名で理解できるか。
- property bindingとattribute bindingを混同していないか。ARIAは適切にattributeへ反映されるか。
- pipeは純粋な表示変換か。高コスト処理や状態変更を含まないか。
- `innerHTML`、動的URL、style値等の信頼境界を確認したか。
- templateをインライン化せず、プロジェクト方針どおり外部templateに分離しているか。
- 新しい制御構文と旧構文の混在が、局所的一貫性を損なっていないか。

**成果物:** 状態別表示表。条件が複雑なら状態遷移表も作る。

### 6.11 共通部品・再利用設計

**目的:** 共通化の境界が安定し、利用側の業務差を無理に吸収していないか確認する。

**主な確認箇所:** shared UI、directive、pipe、utility、base class、configuration-driven component、table/dialog/form control。

**チェック項目:**

- 2箇所に似たコードがあるだけで早すぎる共通化をしていないか。
- 共通部品が特定Featureのmodel、Store、permissionへ依存していないか。
- input数やboolean flagが増え、内部に複数の別部品が隠れていないか。
- variationをinput、content projection、template、compositionのどれで表すべきか検討したか。
- 共通UIのイベント契約、disabled/loading/error、accessibilityが全利用箇所で一貫するか。
- utilityがAngular DIやグローバル状態へ暗黙依存していないか。
- base class継承によって依存やライフサイクルが見えにくくなっていないか。
- public APIと内部実装を分離し、利用側がprivate構造へ依存していないか。
- 共通化解除が困難なほど抽象化へ業務ルールを埋め込んでいないか。

**ClearMLでの注意:** 独自共通ComponentがPrimeNG等を包む構成では、ライブラリ本体、共通ラッパー、Feature固有templateの3層を分けて責務を確認する。

**成果物:** 共通部品の利用箇所、公開契約、許容するvariation、依存禁止領域を記録する。

### 6.12 Feature境界・依存関係

**目的:** 大規模化しても変更影響をFeature内へ閉じ込められる依存方向を保つ。

**主な確認箇所:** import graph、path alias、barrel、Feature routes/providers/state/effects/data-access、`web-boundaries.json`と境界検査script。

**チェック項目:**

- Featureが別Featureの内部Component、reducer、private utilityを直接importしていないか。
- shared/core/business-logic/data-access/UIの責務と依存方向が明文化されているか。
- 循環importをbarrel fileが隠していないか。
- Feature固有Effectsが更新対象stateのFeature配下にあるか。
- lazy Featureからrootへ不要な静的importが入り、bundle分割を壊していないか。
- sharedへ移したコードが、実質的には1 Featureの業務知識を持っていないか。
- public entry point経由の参照と、深い相対path参照のルールが一貫しているか。
- 境界ルールが文書だけでなくlint/script/CIで検査されるか。
- 既存違反のbaselineが、新規違反を無制限に許す仕組みになっていないか。

**成果物:** 依存レイヤー図、許可/禁止import表、例外と解消方針。

### 6.13 エラー・例外処理

**目的:** 失敗を適切な層で分類し、回復可能性に応じて状態・通知・記録へ反映する。

**主な確認箇所:** HTTP interceptor、`catchError`、NgRx Effect、global ErrorHandler、form error、toast/dialog、retry/fallback。

**チェック項目:**

- 通信失敗、認証失効、権限拒否、validation、競合、not found、server障害を区別するか。
- 低層で握り潰して成功値や空配列へ変換し、本当の「データなし」と混同していないか。
- Effectがエラー後も生存する位置で`catchError`しているか。
- 利用者が次に何をすべきか分かるメッセージか。内部例外をそのまま表示していないか。
- toast、inline error、page error、global errorの使い分けが一貫しているか。
- retry回数、backoff、対象status、cancel条件が明確か。
- optimistic update失敗時にrollbackまたは再取得できるか。
- loading flagが成功、失敗、取消のすべてで解除されるか。
- global handlerと個別処理で同じエラーを二重通知しないか。
- エラー記録にtoken、個人情報、機密responseを含めないか。

**成果物:** エラー分類表。「発生層・変換先・UI表示・retry・ログ・回復操作」を記録する。

### 6.14 認証・認可・権限制御

**目的:** ログイン状態、token、tenant/workspace権限、操作権限を一貫して扱う。

**主な確認箇所:** auth Service/Store/Effects、interceptor、guard、permission selector、template表示、API拒否処理、logout/session expiry。

**チェック項目:**

- 認証と認可を区別しているか。
- client guardやボタン非表示だけを認可として扱わず、backendで同じ権限を検証するか。
- URL直打ち、API直接実行、DOM改変でも保護されるか。
- tokenの保存場所、更新、失効、logout時削除、複数tab同期が明確か。
- 401と403を区別し、再認証、遷移、権限メッセージを適切に処理するか。
- permission取得前に一瞬操作可能になる表示漏れがないか。
- workspace/project切替時に、前スコープの状態とキャッシュが残らないか。
- 非表示にする操作とdisabledで理由を示す操作を使い分けるか。
- 権限判定ロジックが各templateへ複製されていないか。
- redirect先にopen redirectの余地がないか。

**成果物:** 役割×操作の権限表と、UI・guard・APIそれぞれの実施箇所。

### 6.15 ライフサイクル・リソース管理

**目的:** ComponentやFeatureの寿命を越えて処理・参照・外部資源が残らないようにする。

**主な確認箇所:** `takeUntilDestroyed`、`DestroyRef`、Effect cleanup、manual subscription、timer、event listener、Resize/Intersection Observer、WebSocket、dialog/overlay。

**チェック項目:**

- 手動`subscribe()`の必要性と終了条件が明確か。
- Component購読は`AsyncPipe`、Signal変換、`takeUntilDestroyed`等で寿命に結びつくか。
- root Serviceの購読にComponent破棄と同じ終了を期待していないか。
- timer、DOM listener、observer、worker、socket、third-party instanceを破棄するか。
- Effect cleanupが再実行時と最終破棄時の両方で正しいか。
- Route再利用、dialog再表示、tab切替で重複購読・重複listenerが増えないか。
- 非同期callbackが破棄済みviewや古い状態を更新しないか。
- キャッシュやSubjectが参照を保持し続け、巨大responseやComponentを解放不能にしないか。
- `ngOnChanges`、初期化、view/content初期化のタイミング依存が必要最小限か。

**成果物:** 長寿命資源一覧。「作成箇所・所有者・終了契機・cleanup方法」を記録する。

### 6.16 キャッシュ・データ同期

**目的:** サーバー状態の鮮度、重複取得、更新競合、複数画面間の整合性を管理する。

**主な確認箇所:** core/cache、entity state、memoized selector、`shareReplay`、resource、local/session storage、polling、WebSocket、更新後action。

**チェック項目:**

- 何をkeyとして、どのスコープで、いつまで保持するか明確か。
- TTL、明示invalidation、更新API成功、workspace切替、logout等の失効条件があるか。
- 同じ要求の同時実行を重複排除するか。
- stale-while-revalidate、cache-first、network-first等の方針が画面要件に合うか。
- 楽観更新時の一時ID、競合、rollback、server正規化値の反映を扱うか。
- 一覧と詳細、集計と明細など、同じentityの複数表現を同時に更新するか。
- paginationやfilter条件をcache keyへ含めるか。
- backend側更新、別tab、別ユーザー更新をpolling/再取得等で反映する要件があるか。
- local/session storageのschema version、期限、容量、機密性を考慮するか。
- memoizationとサーバーデータcacheを混同していないか。

**ClearMLでの注意:** 実験、モデル、タスク等は状態変化が継続する。単発取得だけでなく、更新頻度、polling停止、表示中entityとの整合を確認する。

**成果物:** cache表。「key・格納先・生成・読取・失効・再検証・競合時動作」を記録する。

### 6.17 パフォーマンス・変更検知

**目的:** 初期表示、操作応答、描画、通信、メモリの無駄を根拠に基づいて減らす。

**主な確認箇所:** lazy route、`@defer`、`@for track`、computed/selector、virtual scroll、bundle、network、Angular DevTools、browser profiler。

**チェック項目:**

- 推測だけで最適化せず、bundle、render回数、long task、memory、networkを計測したか。
- Feature単位のlazy loadと、画面内の重い部品の`@defer`を使い分けるか。
- 大量行を全DOM化せず、pagination/virtual scrollを検討したか。
- listの識別子追跡が安定し、並べ替えで不要なComponent再生成がないか。
- selector/computedが参照安定性を失い、毎回新しい配列・objectを大量生成しないか。
- templateから高コスト関数を繰り返し実行しないか。
- 同一APIの重複呼び出し、過剰polling、逐次実行可能な独立要求がないか。
- chart、editor、画像、巨大JSONを初期bundleまたはmain threadへ不要に載せないか。
- subscription、cache、overlay等によるmemory leakを長時間操作で確認したか。
- loading indicatorだけでなく、取消可能性や段階表示もUXとして検討したか。

**プロジェクト方針:** Angular 22の本プロジェクトでは`changeDetection: ChangeDetectionStrategy.OnPush`を機械的に追記することを改善としない。実際の変更検知方式と計測結果を根拠に判断する。

**成果物:** 計測条件、before/after、許容基準。根拠のない「速くなるはず」は記録しない。

### 6.18 スタイル・レイアウト

**目的:** 見た目の責務、CSSの影響範囲、レスポンシブ・テーマ対応を維持可能にする。

**主な確認箇所:** component style、global style、theme token、CSS custom property、utility class、PrimeNG/Material override、layout container。

**チェック項目:**

- global styleとComponent固有styleの責務を分けているか。
- `::ng-deep`、高すぎるspecificity、`!important`でライブラリ内部構造へ過度に依存していないか。
- 色、余白、typography、z-indexがdesign tokenではなく散在するmagic valueになっていないか。
- viewport幅だけでなく、親containerの狭さ、長い翻訳、拡大表示で崩れないか。
- flex/grid itemの`min-width`、overflow、sticky、scroll containerの組合せが正しいか。
- dialog、overlay、tooltipの重なりとscroll lockが破綻しないか。
- light/dark/high-contrast等、対応対象themeで意味が保たれるか。
- 状態を色だけで伝えていないか。
- library class名へのoverrideがversion updateで壊れやすくないか。

**成果物:** 主要layout責務図、token利用状況、意図的なglobal override一覧。

### 6.19 アクセシビリティ

**目的:** mouseや視覚だけに依存せず、支援技術を含む多様な利用方法で操作可能にする。

**主な確認箇所:** semantic HTML、ARIA、label、focus、keyboard event、dialog/menu/table、error message、axe/Playwright test。

**チェック項目:**

- click可能な`div`ではなくbutton/link等の適切な要素を使うか。
- inputに認識可能なlabel、説明、エラー関連付けがあるか。
- tab順が視覚順と一致し、正の`tabindex`へ依存していないか。
- dialogを開いた時のfocus移動、trap、閉じた後のfocus復帰があるか。
- menu、table、tree、tabs等のkeyboard操作が役割に合うか。
- loading、保存完了、非同期error等が必要に応じて支援技術へ通知されるか。
- icon-only操作にaccessible nameがあるか。
- 色だけに依存せず、contrastとfocus indicatorが十分か。
- virtual scrollや動的追加で読み上げ・focus位置が破綻しないか。
- 自動検査に加え、keyboardのみの主要操作を手動確認したか。

**成果物:** 主要操作別のkeyboard/focus表と、自動検査では判定できない手動確認結果。

### 6.20 テスト設計

**目的:** 重要な業務規則と壊れやすい統合点を、適切な速さと粒度で保証する。

**主な確認箇所:** Vitest/Angular TestBed、Http testing、router test、NgRx reducer/effect/selector/store test、Playwright、accessibility、mutation test。

**チェック項目:**

- 実装行ではなく、利用者から見える振る舞いと業務不変条件をテストするか。
- pure変換/validator/reducer/selectorは小さい単体テストで確認できるか。
- Component testはDOM、input/output、form、DI統合など描画が必要なものに絞るか。
- Effect/API testで成功、失敗、取消、競合、response変換を確認するか。
- E2Eは主要経路、権限境界、backend契約など層をまたぐ価値があるものか。
- loading/error/empty/permission deniedを含む状態分岐を網羅するか。
- 時刻、乱数、network、animation、debounceによりflakyにならないか。
- private methodや内部DOM構造へ過度に結合していないか。
- mockしすぎて本番のprovider階層、interceptor、router挙動と別物になっていないか。
- bug修正時に再現テストが先に失敗し、修正後に通ることを確認したか。
- coverage率だけで十分とせず、mutation testや重要経路一覧から弱いassertionを検出するか。

**成果物:** リスク×テスト層の対応表。未テスト理由と代替検証も記録する。

### 6.21 ログ・デバッグ容易性

**目的:** 開発時・運用時に、状態遷移と失敗原因を再現・相関できるようにする。

**主な確認箇所:** logger、global error、HTTP correlation ID、NgRx DevTools、router events、feature-specific debug flag、monitoring連携。

**チェック項目:**

- console出力が散在せず、levelと出力先を制御できるか。
- request ID、task/experiment ID、route、操作名等、追跡に必要なcontextがあるか。
- 同じ失敗についてclient log、server log、利用者報告を相関できるか。
- action/stateを記録する場合、巨大payloadや機密値を除外するか。
- 本番でdebug logを容易に有効化・無効化でき、常時性能を損なわないか。
- エラーを文字列化しすぎず、分類、cause、stack等の診断情報を保持するか。
- retryやfallbackが元の失敗を隠していないか。
- 一時的な`console.log`やdebug UIが本番へ残っていないか。
- 再現手順に必要なURL、filter、sort、Feature flag等を取得できるか。

**成果物:** イベント/エラーごとの記録項目、level、送信先、秘匿項目、保持方針。

### 6.22 設定・環境依存

**目的:** build環境、runtime環境、tenant差、Feature flag、外部endpointをコードから分離する。

**主な確認箇所:** `environment`相当、`src/env.js`、`configuration.json`、credentials生成、ApplicationConfig、InjectionToken、Feature flag、proxy/build config。

**チェック項目:**

- build-time設定とruntime設定を区別し、変更反映方法が明確か。
- 開発、test、本番で同じ設定schemaを使い、必須値不足を起動時に検出するか。
- boolean/number/listをすべて文字列として誤解釈しないか。
- URL結合、末尾slash、protocol、path prefixが環境差で壊れないか。
- Feature flag OFF時に、Route、provider、state、UIが中途半端に残らないか。
- 設定値をComponent各所で直接読み、defaultや変換規則が重複していないか。
- 秘密情報をfrontend bundleや公開設定へ含めていないか。frontendへ渡した値は秘密にできない。
- testが開発者PCの環境変数や実サービスへ暗黙依存していないか。
- 設定変更の互換性、schema version、fallback方針があるか。

**成果物:** 設定項目表。「型・必須・default・供給元・読取箇所・秘密性・変更反映」を記録する。

### 6.23 セキュリティ実装

**目的:** browser、外部入力、backend、storage、第三者ライブラリの信頼境界を明確にし、攻撃可能性を下げる。

**主な確認箇所:** template binding、`innerHTML`、DomSanitizer、URL生成、ElementRef、storage、token、upload/download、依存package、CSP/Trusted Types。

**チェック項目:**

- 外部値をAngular template binding経由で扱い、不要な直接DOM操作を避けるか。
- `bypassSecurityTrust*`の全利用箇所について、値の生成元と検証を個別に説明できるか。
- user入力からtemplate、HTML、script、resource URLを組み立てていないか。
- redirect、link、iframe、download URLのscheme/host/pathを許可制で検証するか。
- tokenや機密データをlocalStorage、ログ、URL、エラー通知へ不用意に残さないか。
- client側validationや非表示制御だけで重要操作を保護していないか。
- CSRF/XSRF、CORS、cookie属性、認証headerの責務をbackend設定と合わせて確認したか。
- file uploadの拡張子、MIME、sizeだけをclient検証で信用していないか。
- spreadsheet exportで数式注入等、出力先固有の危険を考慮するか。
- dependencyの脆弱性、license、lockfile、供給元、build成果物を検査するか。
- CSPとTrusted Typesを導入できるか。導入済みなら違反を迂回していないか。
- エラー本文、stack、設定、source mapが利用者へ過剰公開されないか。

**成果物:** trust boundary図、危険sink一覧、入力元→検証→利用先の対応表。

### 6.24 条件に応じて追加する横断確認

23観点は通常のAngular Web実装を追うための基本分類であり、あらゆる案件で無条件に完全という意味ではない。対象Featureに次の要件がある場合は、関連する複数観点へ追加チェックする。

| 条件 | 追加確認 | 主に追加する観点 |
| --- | --- | --- |
| 多言語・多地域対応 | 翻訳漏れ、複数形、文字列連結、日時・数値・通貨・timezone、RTL、長い翻訳 | 5、10、18、19、20 |
| SSR・hydration | browser API参照、初期状態転送、二重fetch、hydration mismatch、利用者固有cache | 3、4、8、15、16、17、23 |
| Service Worker・offline | cache version、更新通知、offline mutation、再送、古いbundle/API互換性 | 13、16、17、22、23 |
| WebSocket・SSE | 再接続、重複event、順序、heartbeat、認証更新、破棄 | 8、14、15、16、21 |
| 大容量可視化 | worker利用、sampling、virtualization、描画取消、memory上限 | 8、15、17、20 |
| analytics・telemetry | 同意、個人情報、event重複、命名schema、送信失敗 | 8、21、22、23 |
| browser/device対応 | 対応範囲、polyfill、touch、mobile viewport、clipboard/download差 | 17、18、19、20、22 |
| 外部UI・editor・chart | wrapper境界、sanitization、cleanup、bundle、version互換性 | 10、11、15、17、23 |

依存packageが存在するだけで、これらの機能が実際に使われているとは判断しない。Route、bootstrap設定、呼び出し元、build設定、実行結果のいずれかで利用を確認する。

## 7. 横断レビュー手順

### Step 1: 対象と代表操作を固定する

次を最初に1文で書く。

```text
対象: Experiments一覧で検索条件を変更し、結果がテーブルへ反映されるまで
```

「Experiments画面全体」のように広く始めない。作成、更新、削除、検索、選択、遷移は別操作として追う。

### Step 2: 静的な所有関係を追う

1. RouteからPage/Containerを特定する。
2. templateから主要Componentツリーを作る。
3. Route、Feature、Componentのprovider位置を記録する。
4. importのFeature境界を確認する。

### Step 3: データの往路を追う

1. DOM eventまたはform changeを起点にする。
2. output、handler、action、store methodを辿る。
3. Effect/Facade/ServiceからAPI requestまで辿る。
4. request DTOとbackend契約を照合する。

### Step 4: データの復路を追う

1. response DTOの変換を確認する。
2. reducer/Signal Storeの更新を確認する。
3. selector/computed/inputを通ってtemplateへ戻る経路を追う。
4. loading/error/empty状態を確認する。

### Step 5: 時間と競合を加える

- 連打した場合
- response順が逆転した場合
- 途中で別Routeへ移動した場合
- workspaceや対象IDを切り替えた場合
- polling中に更新した場合
- 別画面・別tab・別ユーザーが更新した場合

### Step 6: 信頼境界と権限を加える

- 未ログイン、権限不足、期限切れtoken
- URL直打ち、改変したparam/queryParam
- 不正なresponse、欠損項目、予期しないstatus
- HTML、URL、ファイル名、export値などの外部入力

### Step 7: 終了と検証を確認する

- Component破棄時の購読・timer・listener停止
- キャッシュ失効と状態初期化
- unit/component/E2Eのテスト境界
- ログと再現情報

## 8. 調査結果の記録テンプレート

```markdown
## 対象

- Feature:
- 画面/Route:
- 代表操作:
- 調査時点:

## 結論

- 正本となる状態:
- 更新主体:
- API:
- 画面反映:

## 経路

URL → Component → event → action/store → effect/service → API
API → effect/service → reducer/store → selector/computed → template

## 観点別結果

| # | 観点 | 判定 | 根拠 | 指摘/残課題 |
| ---: | --- | --- | --- | --- |
| 1 | コンポーネントツリー | 確認済み | `...` | なし |
| 2 | 状態管理 | 推測含む | `...` | 正本が二重の可能性 |

## 指摘

### [High] 指摘タイトル

- 現象:
- 発生条件:
- 原因:
- 影響:
- 根拠:
- 推奨修正:
- 確認方法:

## 不明点

- 不明な内容:
- 確認に必要なもの:
```

## 9. このリポジトリで最初に見る場所

| 目的 | 主な場所 |
| --- | --- |
| 起動・root provider | `src/main.ts`、`src/app/app.config.ts` |
| Route全体 | `src/app/app.routes.ts`、各Featureの`*.routes.ts` |
| 業務API | `src/app/business-logic/api-services/` |
| 業務model | `src/app/business-logic/model/` |
| Feature | `src/app/features/` |
| 既存共通実装 | `src/app/webapp-common/` |
| root寄りの状態・Effect | `src/app/core/`、`src/app/webapp-common/core/` |
| Feature状態の例 | `src/app/features/*/state/`、`reducers/`、`effects/`、`actions/` |
| Signal Storeの例 | `*.store.ts` |
| cache | `src/app/webapp-common/core/cache/` |
| 依存境界 | `web-boundaries.json`、`scripts/web-boundaries.mjs` |
| test | `*.spec.ts`、`e2e/`、`vitest.config.ts`、`playwright.config.ts` |
| runtime設定 | `src/env.js`、`src/configuration.json`、`src/credentials*.json` |

検索語は発見の入口にすぎない。該当件数だけで「使われている設計」を結論づけず、代表経路の実利用まで確認する。

## 10. 完了条件

レビュー完了は、23項目を機械的にチェックした時点ではない。対象操作について次を説明できることを完了条件とする。

- どのURLから、どのComponentツリーが表示されるか。
- ユーザー操作がどの通信手段で状態更新へ届くか。
- 状態の正本と更新主体は誰か。
- どのDI経路でAPIへ到達するか。
- 同時実行、取消、失敗、再試行、破棄時にどうなるか。
- responseがどの変換と状態更新を通って再描画されるか。
- 権限、キャッシュ、環境差、セキュリティ上の信頼境界はどこか。
- 重要な振る舞いをどのテストが保証し、障害時に何を記録するか。
- 確認済み・推測・不明・対象外が区別されているか。

## 11. 参考資料

現行Angularの挙動を確認する際は、二次解説より公式ドキュメントを優先する。

- [Angular: Hierarchical injectors](https://angular.dev/guide/di/hierarchical-dependency-injection)
- [Angular: Defining dependency providers](https://angular.dev/guide/di/defining-dependency-providers)
- [Angular: Route API](https://angular.dev/api/router/Route)
- [Angular: Route guards](https://angular.dev/guide/routing/route-guards)
- [Angular: Route data resolvers](https://angular.dev/guide/routing/data-resolvers)
- [Angular: Lazy-loaded routes](https://angular.dev/best-practices/performance/lazy-loaded-routes)
- [Angular: Reactive data fetching with httpResource](https://angular.dev/guide/http/http-resource)
- [Angular: Async reactivity with resources](https://angular.dev/guide/signals/resource)
- [Angular: Reactive forms](https://angular.dev/guide/forms/reactive-forms)
- [Angular: ControlValueAccessor](https://angular.dev/api/forms/ControlValueAccessor)
- [Angular: Templates](https://angular.dev/guide/templates)
- [Angular: Deferred loading with @defer](https://angular.dev/guide/templates/defer/)
- [Angular: Security](https://angular.dev/best-practices/security)
