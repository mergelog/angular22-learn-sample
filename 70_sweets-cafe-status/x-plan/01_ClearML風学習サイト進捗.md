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
- [ ] Phase 3: NgRxへ移行
- [ ] Phase 4: URL連動の右ペイン
- [ ] Phase 5: 編集とエラー処理
- [ ] 初期完成版の受け入れ条件をすべて達成

現在は、既存APIから取得したテーブル状況をSignalで表示でき、Phase 2の
`CafeTablesGrid` への一覧表分離とcomponent testまで完了し、Phase 3で使用する
`@ngrx/store` と `@ngrx/effects` を追加した段階である。
画面にはトップバー、サイドバー、集計欄、6列の一覧表を用意している。
行選択は親子間で受け渡せるが、右ペイン、NgRx、編集処理は追加していない。

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
- [ ] `loadDashboardFailure` actionを追加
- [ ] 一覧取得effectを `exhaustMap` で実装
- [ ] HTTPエラーを画面表示用メッセージへ変換
- [ ] componentからの直接API呼び出しを削除
- [ ] Storeの読み出しを `selectSignal()` に統一
- [ ] 再読み込みを `loadDashboard` のdispatchへ変更

### 完了条件

- [ ] effect testで取得成功を確認できる
- [ ] effect testで取得失敗を確認できる
- [ ] reducer testで状態遷移を確認できる
- [ ] `ViewJson` 以外のcomponentがAPIを直接呼んでいない
- [ ] 再読み込み開始時に以前の取得エラーが消える

## 6. Phase 4: URL連動の右ペイン

### 基底class

- [ ] `BaseCafeEntityPage` を追加
- [ ] `CafeTables` を `BaseCafeEntityPage` の継承へ変更
- [ ] `BaseCafeTableOutput` を追加
- [ ] `CafeTableOutput` を `BaseCafeTableOutput` の継承で作成

### ルートと画面

- [ ] `/cafe-status/:tableNumber` を追加
- [ ] `/cafe-status/:tableNumber/overview` を追加
- [ ] `CafeTableOutput` を追加
- [ ] `CafeInfoHeader` を追加
- [ ] `CafeTableOverview` を追加
- [ ] `angular-split` で左右の分割レイアウトを作成
- [ ] URLから選択中のテーブル番号を取得
- [ ] 選択中の行を強調表示
- [ ] 行選択でoverviewへ遷移
- [ ] closeで `/cafe-status` へ遷移
- [ ] 戻る・進むで選択状態を同期
- [ ] 存在しないテーブルのnot-found表示を追加
- [ ] 初回取得中のloading表示を追加
- [ ] 詳細ペインに取得時刻を表示

### 分割比率

- [ ] `changeSplitPercent` actionを追加
- [ ] reducerで分割比率を保持
- [ ] `dragEnd` をactionのdispatchへ接続

### 完了条件

- [ ] URL直接入力で対象の右ペインが開く
- [ ] 行クリックで対象の右ペインが開く
- [ ] closeで右ペインと行選択が解除される
- [ ] 戻る・進むで右ペインと行選択が同期する
- [ ] 読み込み中にnot-foundが一瞬表示されない
- [ ] 存在しない番号と大小文字違いでnot-foundになる
- [ ] ペイン開閉用のbooleanを保持していない
- [ ] 一覧と詳細が同じselectorのデータを参照する
- [ ] ドラッグ後も分割比率が維持される

## 7. Phase 5: 編集とエラー処理

### 編集UI

- [ ] `CafeInfoHeader` にReactive Formsを追加
- [ ] 編集中かどうかをSignalで管理
- [ ] 状態の入力欄を追加
- [ ] 人数の入力欄を追加
- [ ] 会計金額の入力欄を追加
- [ ] 人数を0以上の整数として検証
- [ ] 会計金額を0以上の整数として検証
- [ ] invalidまたは送信中は保存ボタンを無効化

### 更新処理

- [ ] `updateTable` actionを追加
- [ ] `updateTableSuccess` actionを追加
- [ ] `updateTableFailure` actionを追加
- [ ] 更新effectを `concatMap` で実装
- [ ] 更新成功時に該当する一覧データを置換
- [ ] 更新失敗時に入力内容を維持
- [ ] 更新対象と一致するエラーだけを詳細ペインへ表示
- [ ] 400と404を区別できるエラーメッセージを追加
- [ ] 複数更新時に先の応答で後の送信中状態を解除しない

### 完了条件

- [ ] 更新成功時に一覧と詳細が同時に更新される
- [ ] API応答値を正として表示する
- [ ] 更新失敗時にStoreのテーブルを変更しない
- [ ] 更新失敗時にフォーム入力とエラーを残す
- [ ] 別テーブルへ以前の更新エラーが表示されない
- [ ] 同じフォームからの二重送信を防止できる
- [ ] 別テーブルの後続更新が破棄されない
- [ ] 更新成功と更新失敗の自動テストが成功する

## 8. 初期完成版の最終確認

- [x] Dashboardから `/cafe-status` を開ける
- [x] `/cafe-status` と `/view-json` を相互に移動できる
- [x] 読み込み、エラー、空、通常の4状態を表示できる
- [ ] 行クリックでoverviewの右ペインを開ける
- [ ] URLと行選択と右ペインが同期する
- [ ] 存在しないテーブルをnot-found表示できる
- [ ] closeで一覧だけの表示へ戻れる
- [ ] 状態、人数、会計金額を更新できる
- [x] `generatedAt` と手動再読み込みを利用できる
- [ ] URL、NgRx、Form/Signalの正本が重複していない
- [ ] 一覧、ルート、reducer、effect、更新の自動テストが成功する
- [x] production buildが成功する

## 9. 次に着手する項目

Phase 3のStateファイルと登録、一覧取得の開始・成功actionまで追加済み。
次は `loadDashboardFailure` actionを追加する。
