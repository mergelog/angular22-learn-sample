# ClearML風学習サイト進捗

最終更新: 2026-09-20

## 1. 見方

- `[x]`: 完了
- `[ ]`: 未完了
- フェーズ内に未完了項目が残っている場合、フェーズ全体は未完了として扱う
- 実装内容を変更したときは、チェック状態と「現在地」を同時に更新する

### 「進めて」の運用

この資料を対象に「進めて」とだけ指示された場合は、次の手順で作業を継続する。

1. 「現在地」と「次に着手する項目」を確認し、現在のフェーズ内で最初に未完了項目が
   ある `###` 見出しを作業範囲とする。
2. 対象の `###` 内にある未完了チェックボックスを上から1件ずつ実施する。現在の
   チェックボックスが完了するまで次へ進まず、次の `###` 見出しには着手しない。
3. チェックボックス1件ごとに必要な実装とテストを行い、対象のチェックだけを `[x]`
   に変更する。「現在地」と「次に着手する項目」も各時点の実態に合わせて更新する。
4. コードを変更した場合は、チェックボックス1件ごとに全自動テストとproduction buildを
   実行する。失敗または未完了の場合はチェックを進めず、原因を報告して作業を止める。
5. チェックボックス1件分の実装、テスト、この資料の更新だけを1コミットにまとめる。
   無関係な変更はコミットに含めない。コミット後は対象の `###` が完了するまで次の
   未完了チェックボックスへ進む。
6. 対象の `###` 内にあるチェックボックスをすべて完了したら作業を止め、完了した
   チェック項目、各検証結果、各コミットID、次の項目を報告する。

フェーズ全体や最終確認のチェックボックスは、その配下または対応する条件がすべて
完了した後に、独立した1件として更新する。

## 2. 現在地

- [x] `/cafe-status` の画面のガワを作成
- [x] Phase 1: Signalで一覧を描画
- [x] Phase 2: 表をinput/outputで分離
- [x] Phase 3: NgRxへ移行
- [x] Phase 4: URL連動の右ペイン
- [ ] Phase 5: 編集とエラー処理
- [ ] 初期完成版の受け入れ条件をすべて達成

現在は、既存APIから取得したテーブル状況をNgRx Store経由でSignalとして表示でき、
Phase 4のURL連動に用いる2つの基底classと具象の詳細ペインcomponentを用意し、
`/cafe-status/:tableNumber` をoverviewへ正規化する子routeと、overviewから
詳細ペインを遅延ロードするrouteを追加し、親画面の子outletへ
`CafeTableOutput` を描画し、`CafeInfoHeader` で選択テーブルの要約とclose操作を
扱える。子routeの `CafeTableOverview` で利用率とステータス別時間も表示でき、
`angular-split` で一覧と詳細の左右領域を分けている。URLの `tableNumber` を
選択状態と右ペイン表示の正本にし、一致する一覧行の強調表示と、
行選択からoverviewへの遷移、closeから一覧URLへの遷移を行える段階である。
分割比率はStoreの `splitPercent` を正本にし、gutterのドラッグ終了で
`changeSplitPercent` をdispatchして左右のsizeへ反映している。
URL直接入力でも選択状態を取得できるよう、`BaseCafeEntityPage` は自routeの
snapshotから子の `tableNumber` を読むようにし、実routeを使った結合testで
URL直接入力と一覧の行クリックの両方から右ペインが開き、closeで右ペインと
行の選択状態が解除され、ブラウザの戻る・進むでも両者が同期し、初回取得が
完了するまではnot-foundではなくloadingを表示し、存在しない番号と大小文字違いの
URLではnot-foundになることを確認している。右ペインの開閉はURLだけを正本とし、
Storeにもcomponentにも開閉用のbooleanを持たない。一覧と詳細はどちらも
`selectDashboard` を参照し、再読み込み後も同じ値で更新される。ドラッグで変えた
分割比率はStoreに残るため、テーブル間の遷移やペインの開閉後も維持される。
APIの直接参照は `ViewJson` とeffectだけに限定している。
画面にはトップバー、サイドバー、集計欄、6列の一覧表を用意している。
`CafeInfoHeader` には状態、人数、会計金額のReactive Formsを追加し、表示対象の
テーブル番号が変わったときだけ入力内容を現在値へ戻すようにした。同じテーブルの
再取得では入力中の値を保持する。編集欄の開閉は `editing` Signalで管理し、
編集ボタンで開き、キャンセルで閉じて入力内容を破棄し、保存で更新内容を
`saveRequested` として親へ通知する。表示対象が別テーブルへ変わったときは編集を
終了する。編集欄には `TABLE_STATUSES` を選択肢とする状態の `select` と、人数と
会計金額の数値入力欄を用意した。人数と会計金額は共通validator
`nonNegativeInteger` で0以上の整数だけを許可し、未入力や小数、負の値では
入力欄の下にエラーを表示する。保存ボタンはinvalidまたは `saving` inputがtrueの
あいだ無効化し、`save()` でも同じ条件で親への通知を止めている。
保存時は `updateTable` actionをdispatchする。更新成功時のAPI応答を受ける
`updateTableSuccess` actionと、対象番号・メッセージを保持する
`updateTableFailure` actionも定義済み。更新effectは `concatMap` で更新要求を受信順に
APIへ送り、成功・失敗actionへ変換する。更新成功時はAPI応答の `CafeTable` で
dashboard内の該当行だけを置換する。
更新開始時は対象番号をStoreへ保存して詳細フォームを送信中にし、失敗時はdashboardを
変更せず送信中状態だけを終了する。同じテーブルのAPI応答ではフォームを初期化しないため、
失敗後も編集欄と入力値を維持する。更新エラーはStore上の対象番号とURLの選択番号が
一致する場合だけ詳細ペインへ表示する。更新APIの400は入力内容不正、404は更新対象なし、
その他は一般的な更新失敗として異なるメッセージへ変換する。
複数更新時は成功・失敗actionの対象番号が現在の `updatingTableNumber` と一致する場合だけ
送信中状態を解除するため、先の応答が後続テーブルの送信中表示を解除しない。

## 3. Phase 1: Signalで一覧を描画

### 実装

- [x] `/cafe-status` のルートを追加
- [x] `CafeTables` を追加
- [x] componentから `CafeDashboardApi.getDashboard()` を呼び出す
- [x] Signalでdashboard、loading、errorを管理
- [x] 取得時刻 `generatedAt` を表示
- [x] 手動の再読み込みボタンを追加
- [x] Dashboardから `/cafe-status` へのリンクを追加
- [x] `/cafe-status` からDashboardと `/view-json` へのリンクを追加
- [x] `/view-json` から `/cafe-status` へのリンクを追加
- [x] ClearML風のトップバー、サイドバー、一覧パネルを作成
- [x] 画面幅が狭い場合の最低限のレスポンシブ表示を追加

### 完了条件

- [x] 初回読み込み中を表示できる
- [x] 取得エラーを表示できる
- [x] 空データを表示できる
- [x] 通常データを表示できる
- [x] 全テーブルを固定6列で表示できる
- [x] 再読み込みで最新の `generatedAt` と経過時間を取得できる
- [x] component testで一覧表示を確認できる
- [x] Dashboardのリンクをtestで確認できる
- [x] 全自動テストが成功する
- [x] production buildが警告なしで成功する

## 4. Phase 2: 表をinput/outputで分離

### 実装

- [x] `CafeTablesGrid` を追加
- [x] 一覧表のHTMLと表示処理を `CafeTablesGrid` へ移動
- [x] `tables` inputを追加
- [x] `selectedTableNumber` inputを追加
- [x] `tableSelected` outputを追加
- [x] 親componentをデータ取得とイベント処理に限定
- [x] 子componentからAPI、Store、Routerへの依存を排除

### 完了条件

- [x] inputで渡したテーブルを描画できる
- [x] 行操作で `tableSelected` が発火する
- [x] `CafeTablesGrid` のcomponent testが成功する

## 5. Phase 3: NgRxへ移行

### 依存関係

- [x] `@ngrx/store@^22.0.1` を追加
- [x] `@ngrx/effects@^22.0.1` を追加

### State

- [x] `cafe-status.actions.ts` を追加
- [x] `cafe-status.reducer.ts` を追加
- [x] `cafe-status.selectors.ts` を追加
- [x] `cafe-status.effects.ts` を追加
- [x] `provideStore()` をアプリへ登録
- [x] `/cafe-status` の親routeへ `provideState()` を登録
- [x] `/cafe-status` の親routeへ `provideEffects()` を登録

### 一覧取得

- [x] `loadDashboard` actionを追加
- [x] `loadDashboardSuccess` actionを追加
- [x] `loadDashboardFailure` actionを追加
- [x] 一覧取得effectを `exhaustMap` で実装
- [x] HTTPエラーを画面表示用メッセージへ変換
- [x] componentからの直接API呼び出しを削除
- [x] Storeの読み出しを `selectSignal()` に統一
- [x] 再読み込みを `loadDashboard` のdispatchへ変更

### 完了条件

- [x] effect testで取得成功を確認できる
- [x] effect testで取得失敗を確認できる
- [x] reducer testで状態遷移を確認できる
- [x] `ViewJson` 以外のcomponentがAPIを直接呼んでいない
- [x] 再読み込み開始時に以前の取得エラーが消える

## 6. Phase 4: URL連動の右ペイン

### 基底class

- [x] `BaseCafeEntityPage` を追加
- [x] `CafeTables` を `BaseCafeEntityPage` の継承へ変更
- [x] `BaseCafeTableOutput` を追加
- [x] `CafeTableOutput` を `BaseCafeTableOutput` の継承で作成

### ルートと画面

- [x] `/cafe-status/:tableNumber` を追加
- [x] `/cafe-status/:tableNumber/overview` を追加
- [x] `CafeTableOutput` を追加
- [x] `CafeInfoHeader` を追加
- [x] `CafeTableOverview` を追加
- [x] `angular-split` で左右の分割レイアウトを作成
- [x] URLから選択中のテーブル番号を取得
- [x] 選択中の行を強調表示
- [x] 行選択でoverviewへ遷移
- [x] closeで `/cafe-status` へ遷移
- [x] 戻る・進むで選択状態を同期
- [x] 存在しないテーブルのnot-found表示を追加
- [x] 初回取得中のloading表示を追加
- [x] 詳細ペインに取得時刻を表示

### 分割比率

- [x] `changeSplitPercent` actionを追加
- [x] reducerで分割比率を保持
- [x] `dragEnd` をactionのdispatchへ接続

### 完了条件

- [x] URL直接入力で対象の右ペインが開く
- [x] 行クリックで対象の右ペインが開く
- [x] closeで右ペインと行選択が解除される
- [x] 戻る・進むで右ペインと行選択が同期する
- [x] 読み込み中にnot-foundが一瞬表示されない
- [x] 存在しない番号と大小文字違いでnot-foundになる
- [x] ペイン開閉用のbooleanを保持していない
- [x] 一覧と詳細が同じselectorのデータを参照する
- [x] ドラッグ後も分割比率が維持される

## 7. Phase 5: 編集とエラー処理

### 編集UI

- [x] `CafeInfoHeader` にReactive Formsを追加
- [x] 編集中かどうかをSignalで管理
- [x] 状態の入力欄を追加
- [x] 人数の入力欄を追加
- [x] 会計金額の入力欄を追加
- [x] 人数を0以上の整数として検証
- [x] 会計金額を0以上の整数として検証
- [x] invalidまたは送信中は保存ボタンを無効化

### 更新処理

- [x] `updateTable` actionを追加
- [x] `updateTableSuccess` actionを追加
- [x] `updateTableFailure` actionを追加
- [x] 更新effectを `concatMap` で実装
- [x] 更新成功時に該当する一覧データを置換
- [x] 更新失敗時に入力内容を維持
- [x] 更新対象と一致するエラーだけを詳細ペインへ表示
- [x] 400と404を区別できるエラーメッセージを追加
- [x] 複数更新時に先の応答で後の送信中状態を解除しない

### 完了条件

- [x] 更新成功時に一覧と詳細が同時に更新される
- [x] API応答値を正として表示する
- [x] 更新失敗時にStoreのテーブルを変更しない
- [x] 更新失敗時にフォーム入力とエラーを残す
- [x] 別テーブルへ以前の更新エラーが表示されない
- [x] 同じフォームからの二重送信を防止できる
- [x] 別テーブルの後続更新が破棄されない
- [ ] 更新成功と更新失敗の自動テストが成功する

## 8. 初期完成版の最終確認

- [x] Dashboardから `/cafe-status` を開ける
- [x] `/cafe-status` と `/view-json` を相互に移動できる
- [x] 読み込み、エラー、空、通常の4状態を表示できる
- [x] 行クリックでoverviewの右ペインを開ける
- [x] URLと行選択と右ペインが同期する
- [x] 存在しないテーブルをnot-found表示できる
- [x] closeで一覧だけの表示へ戻れる
- [ ] 状態、人数、会計金額を更新できる
- [x] `generatedAt` と手動再読み込みを利用できる
- [ ] URL、NgRx、Form/Signalの正本が重複していない
- [ ] 一覧、ルート、reducer、effect、更新の自動テストが成功する
- [x] production buildが成功する

## 9. 次に着手する項目

Phase 5の「編集UI」は完了。Reactive Formsの追加、`editing` Signalでの開閉管理、
状態・人数・会計金額の入力欄、人数と会計金額の `nonNegativeInteger` 検証、
invalidと送信中の保存ボタン無効化までをcomponent testで確認済み。`select` の
表示値は `afterNextRender` で同期されるため、testでは `TestBed.tick()` を使う。
`updateTable` actionを追加し、`CafeInfoHeader` の `saveRequested` を
`CafeTableOutput` のdispatchへ接続済み。API応答の `CafeTable` をpayloadに持つ
`updateTableSuccess` actionと、対象番号・メッセージをpayloadに持つ
`updateTableFailure` actionも追加した。更新effectは `concatMap` で実装し、複数要求を
受信順に直列実行することをeffect testで確認済み。更新成功時はAPI応答値で該当する
一覧データだけを置換する。更新失敗時は一覧を変更せず、編集欄と入力内容を維持する。
更新エラーは対象番号が選択中のテーブル番号と一致する場合だけ詳細ペインへ表示する。
更新APIの400、404、その他を異なるエラーメッセージへ変換することもeffect testで確認済み。
複数更新時は先の成功・失敗応答で後続テーブルの送信中状態を解除しないこともreducer testで
確認し、「更新処理」は完了。更新APIの成功応答後に、同じStoreを参照する一覧と
詳細の状態表示が同時に更新されることを結合testで確認済み。送信値と異なるAPI応答を
返すtestで、一覧と詳細がAPI応答値を正として表示することも確認済み。更新APIの
500応答後も一覧と詳細が更新前のStoreの値を表示することも結合testで確認済み。
同じ失敗経路で編集欄が開いたまま入力値を維持し、更新エラーを表示することも結合testで
確認済み。T01の更新失敗後にT02へ遷移するtestで、T01のエラーがT02に表示されないことも
確認済み。最初のPUTを保留中に再submitするtestで、保存ボタンが無効になりHTTP要求も
1件だけであることを確認済み。T01の応答待ち中にT02を保存するtestで、T02の更新が
破棄されずT01の完了後に開始し、両方が一覧へ反映されることも確認済み。次は更新成功と
更新失敗の自動テスト全体を最終確認する。
