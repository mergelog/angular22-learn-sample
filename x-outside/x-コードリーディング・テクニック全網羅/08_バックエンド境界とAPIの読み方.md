# バックエンド境界とAPIの読み方

画面から先を読む。Angular 側の API 層、ClearML サーバ、そして同じリポジトリに同居する
Python 実装（学習・推論・観測）の三つを扱う。

この境界は、読む量を減らす最大の切り所である。
API の入出力が決まれば、サーバ側を読まずに画面側を読み切れるし、逆もできる。

## 1. Angular 側の API 層

### 1-1. 構成

`src/app/business-logic/` は名前に反してビジネスロジックを持たない。
中身は ClearML の API スキーマから生成された型とクライアントである。

| 場所 | ファイル数 | 中身 |
| --- | --- | --- |
| `business-logic/model/` | 584 | リクエスト・レスポンスの型定義（生成物） |
| `business-logic/api-services/` | 17 | エンドポイントごとのメソッド（生成物） |
| `business-logic/api-services/api-requests.service.ts` | 1 | 実際に `HttpClient` を呼ぶ層（手書き） |

生成物は読まない。読むのは**メソッド名と引数型だけ**である。
`tasks.service.ts` は 2,331 行あるが、本文は生成された定型であり、設計意図は無い。

### 1-2. エンドポイントから実装へ

ClearML の API は `名前空間.動作` の形になっている（`tasks.get_all_ex` など）。
生成コードの中ではテンプレートリテラルで組まれているが、後半は固定文字列なので検索で当たる。

```bash
rg -n -t ts "tasks\.get_all_ex" src
```

`api-services/` 全体で 201 個のエンドポイントが定義されている。一覧はこれで取れる。

```bash
rg -o '\$\{this\.basePath\}/[a-z_]+\.[a-z_]+' src/app/business-logic/api-services -t ts --no-filename | sort -u
```

Network タブで見たパスをそのまま検索語にすれば、呼び出し元のメソッドに直行できる。
これが画面からサーバへ渡る境界を越える最短経路である。

### 1-3. URL がどう組み立てられるか

ベース URL は定数に後から書き込まれる。読む順序は次のとおり。

| 順 | 場所 | やること |
| --- | --- | --- |
| 1 | `src/main.ts` | bootstrap の前に設定を取得し、`updateHttpUrlBaseConstant` を呼ぶ |
| 2 | `src/app/app.constants.ts` | `HTTP.API_BASE_URL` に代入。設定が無ければ `guessAPIServerURL()` で推測 |
| 3 | `api-requests.service.ts` | `${HTTP.API_BASE_URL}/エンドポイント` を組む |

`HTTP` は `export let` で宣言されたミュータブルなオブジェクトである。
import した時点の値ではなく、代入後の値が使われる。
`app.constants.ts:120` に `// <-- DIRECT CALL DOESN'T WORK` というコメントが付いているのは、
この書き方をせざるを得なかった理由の記録である。

開発時は `proxy.config.mjs` が `/service/1/api` を `http://localhost:8008` に転送する。
Network タブに出るパスとコード上のパスが違って見えるのはこのためである。

### 1-4. 共通処理は Interceptor にある

`webapp-common/core/interceptors/webapp-interceptor.ts` が、全リクエストに対して
`X-Clearml-Client` ヘッダを付け、401 のときにログアウトへ飛ばす。

この Interceptor は `app.config.ts` で
`provideHttpClient(withInterceptorsFromDi())` と組で登録されている。
`withInterceptorsFromDi()` が無いと `HTTP_INTERCEPTORS` は読まれず、
通信は動いたまま Interceptor だけが黙って無効になる。
このことは `app.config.ts` にコメントとして書かれている。

「ログイン状態が切れたときの挙動」「共通ヘッダ」を追うときは、ここが唯一の場所である。

## 2. ClearML サーバ側

サーバ本体はこのリポジトリには無い。Docker で動かす。

```bash
pnpm run backend:up       # 起動
pnpm run backend:status   # 状態
pnpm run backend:logs     # ログ
```

サーバの API 仕様を読む手段は三つある。

| 手段 | 使いどころ |
| --- | --- |
| 生成された型（`business-logic/model/`） | リクエスト・レスポンスの形を知る |
| 実際のレスポンス（Network タブ） | 生成型と実際が食い違う場合の確認 |
| ClearML 公式ドキュメント | 意味の確認。リポジトリからは意味が読めない |

生成型は網羅的だが、どのフィールドが実際に返るかは書かれていない。
`: any` が多い箇所では、実レスポンスを見るほうが速い。

同時起動の制約がある。`../001-learn-ClearML` と 8008/8080/8081 を共有しているので、
両方を同時に起動できない。切り替えるときは先にもう片方を停止する。

## 3. Python 側

同じリポジトリに Python 実装が同居している（165 ファイル、28,655 行）。

| 場所 | 役割 |
| --- | --- |
| `ml/` | 学習、パイプライン、データ品質、モデルのライフサイクル、観測 |
| `services/prediction_api/` | 推論 API（FastAPI） |
| `services/ops_exporter/` | 観測指標の出力 |
| `services/contracts/` | OpenAPI 契約 |
| `tools/` | 投入スクリプト、シード、セキュリティ検査 |

Angular 側とは、ClearML サーバを介してつながる。直接の呼び出しは無い。
つまり、画面の調査で Python 側を読む必要はほとんど無い。
読むのは「画面に出ているこの数値は何を計算したものか」を知りたいときだけである。

Python 側の入口は、実行スクリプトから引く。

```bash
node -e "const p=require('./package.json'); Object.entries(p.scripts).filter(([k])=>/^(ml|py|serving|ops|tools|seed)/.test(k)).forEach(([k,v])=>console.log(k,'=',v))"
```

契約の検査が別立てになっている。

```bash
pnpm run web:contract      # Angular 側と Pipeline の契約
pnpm run serving:openapi:update
```

## 4. 境界を越えるときの手順

画面の症状からサーバ側まで辿る場合、次の順で切る。各段で切れれば、その先は読まない。

| 段 | 確かめること | 切れたら |
| --- | --- | --- |
| 1 | Network タブにリクエストが出ているか | 出ていなければ画面側の問題。Effect まで戻る |
| 2 | リクエストのペイロードが期待どおりか | 違えば変換処理の問題。Effect と Converter を読む |
| 3 | レスポンスが期待どおりか | 違えばサーバ側。Angular 側は読まない |
| 4 | レスポンスが Store に入っているか | 入っていなければ Reducer か Effect の問題 |
| 5 | Store の値が画面に出ているか | 出ていなければ Selector かテンプレートの問題 |

この五段は、それぞれ一つの観測で決まる。
1・2・3 は Network タブ、4 は Redux DevTools、5 は Angular DevTools で見る。
静的に読む前にこの五段を通すと、読む範囲が一段ぶんに絞れる。

## 5. 契約と境界規則

`web-boundaries.json` に「生成された API model / service に触れるのは
feature の境界ファイル（api-service / adapter とその spec）だけ」という規則がある。
つまり、自作の feature では生成コードを直接触らず、間に自前の API サービスを挟む設計になっている。

```bash
node scripts/web-boundaries.mjs report
```

この規則を知っていると、feature 側のコードを読むときに
「生成型が出てきたら、そこが境界ファイルである」という判別ができる。
例が `features/data-catalog/data-access/data-catalog-api.service.ts`（580 行）である。
