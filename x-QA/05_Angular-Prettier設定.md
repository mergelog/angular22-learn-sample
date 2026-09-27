# Angular 22 + Prettier 設定 QA

対象: `90_samples/`（Angular 22.1 / prettier 3.9.6 / yarn 1.22）
同じ手順が `70_sweets-cafe-status/` にも適用できます。

## Q. 何を設定したのか

| ファイル | 役割 | 状態 |
| --- | --- | --- |
| `90_samples/.prettierrc` | 整形ルール本体（`printWidth: 100` / `singleQuote` / `*.html` は angular parser） | 既存（Angular CLI 生成物） |
| `90_samples/.prettierignore` | 整形対象外の指定 | 新規 |
| `90_samples/package.json` | `format` / `format:check` スクリプト | 追記 |
| `90_samples/.vscode/settings.json` | 保存時整形・言語別フォーマッタ指定 | 新規 |
| `90_samples/.vscode/extensions.json` | `esbenp.prettier-vscode` を推奨拡張に追加 | 追記 |
| `.vscode/settings.json`（リポジトリ直下） | 同じ保存時整形設定 | 追記 |

`prettier` 自体は `devDependencies` に既に入っていたため追加インストールは不要でした。

```bash
# 未導入プロジェクトで入れる場合
yarn add -D --exact prettier
```

## Q. `ng format` コマンドで整形できるか

Angular CLI 22 には `format` コマンドがありません。`ng --help` の実測結果に含まれるのは
`add / analytics / build / cache / completion / config / deploy / e2e / extract-i18n / generate / lint / new / run / serve / test / update / version` のみです。

そのため npm script 経由で `prettier` を直接呼びます。

```json
"scripts": {
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

`--check` は差分があると終了コード `1` を返すため、CI のチェックに使えます（実測: `exit=1`）。

## Q. `.prettierrc` の `*.html` → `parser: "angular"` は本当に必要か

必要です。Prettier は `.html` に対して既定で html parser を使いますが、これは Angular の制御フロー構文（`@if` / `@for` / `@empty`）を理解できません。

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "overrides": [
    { "files": "*.html", "options": { "parser": "angular" } }
  ]
}
```

実測比較（`c07-ng-template-named-slots/experiment-table/experiment-table.html`）。

```html
<!-- parser: angular → ブロック構造として字下げされる -->
  @if (items().length) {
    @for (item of items(); track item.id; let rowIndex = $index) {
      @if (bodyTemplate(); as template) {
        <ng-container
          [ngTemplateOutlet]="template"
          [ngTemplateOutletContext]="{ $implicit: item, rowIndex }"
        />
      }
    }
  } @else if (emptyTemplate(); as template) {
```

```html
<!-- parser: html → ただのテキストとして折り返され、構造が壊れる -->
  } @if (items().length) { @for (item of items(); track item.id; let rowIndex = $index) { @if
  (bodyTemplate(); as template) {
  <ng-container
```

`@for` / `@empty` を含む `learn-10-signal-store-events.html` でも、angular parser のみ `<li>` がブロック内側に字下げされます。

## Q. `.prettierignore` には何を書いたか

```
# ビルド成果物・キャッシュ
/dist
/out-tsc
/coverage
/.angular
/node_modules

# ロックファイル
yarn.lock

# ドキュメント: 手書きの表組み・コード例を Prettier が組み替えてしまうため対象外
*.md

# 拡張子から parser を推論できないため（明示指定するとエラーになる）
*.concept
```

## Q. なぜ `*.md` を対象外にしたか

このリポジトリの `.md` は手書きの解説資料で、整形すると意図が壊れるためです。実測した変化は3種類でした。

1. 表がCJK幅で再整列され、全行が書き換わる
2. 箇条書きの `*` が `-` に正規化される
3. コードフェンス内のサンプルコードまで整形される（`embeddedLanguageFormatting` の既定が `auto`）

3 が特に問題で、「複数行で書いたテンプレート例」が1行に畳まれます。

```html
<!-- 資料に書いた元のコード -->
<button type="button" (click)="workspaceRef.restoreAll()">
  #ref: すべて元に戻す
</button>
```

```html
<!-- Prettier 通過後: 説明の意図が消える -->
<button type="button" (click)="workspaceRef.restoreAll()">#ref: すべて元に戻す</button>
```

整形したくなったら `.prettierignore` の `*.md` を削除します。表の整列だけ欲しくてコード例を守りたい場合は、`*.md` を消す代わりに `.prettierrc` へ次を追加します。

```json
{ "files": "*.md", "options": { "embeddedLanguageFormatting": "off" } }
```

## Q. `*.concept` を ignore に入れたのはなぜか

`src/` 配下に57件ある拡張子 `.concept` のファイルは、Prettier が parser を推論できません。

- `prettier --write .` のようにディレクトリを展開する場合は、既知の拡張子だけが対象になるため無害
- ファイルを明示指定した場合（VSCode で開いて保存、`prettier <path>` など）はエラーになる

```
[error] No parser could be inferred for file ".../x_非同期データをresourceで取得.concept".
```

`.prettierignore` に入れると明示指定でも skip されます（実測: `All matched files use Prettier code style!`）。

## Q. VSCode で保存時に整形させる設定

拡張機能 `esbenp.prettier-vscode` が必要です（インストール済み: 12.4.0）。`.vscode/extensions.json` の `recommendations` に追加済みなので、未導入の環境では推奨として表示されます。

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.requireConfig": true,
  "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[html]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[scss]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[css]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[json]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[jsonc]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[markdown]": { "editor.formatOnSave": false }
}
```

- 言語別の `[html]` などを明示するのは、Angular Language Service や VSCode 内蔵フォーマッタが既定フォーマッタとして登録されている場合に奪われるのを防ぐためです
- `prettier.requireConfig: true` は「`.prettierrc` が見つからないファイルは整形しない」設定です。`80_tarminal/` のように Prettier 未設定のプロジェクトを、同じワークスペースで開いても誤整形しません
- `[markdown]` は `.prettierignore` で既に対象外ですが、意図を明示するため保存時整形も切っています

## Q. 設定ファイルはどの階層のものが使われるか

**Prettier**: 整形対象ファイルから上位ディレクトリへ辿り、最初に見つかった `.prettierrc` / `.prettierignore` をファイル単位で使います。したがって `90_samples/` と `70_sweets-cafe-status/` はそれぞれの設定で動きます。

**VSCode**: ワークスペースとして開いたフォルダ直下の `.vscode/settings.json` しか読みません。サブディレクトリのものは無視されます。

- リポジトリ直下（`angular22-sample/`）を開く → `angular22-sample/.vscode/settings.json` が有効
- `90_samples/` を直接開く → `90_samples/.vscode/settings.json` が有効

どちらで開いても効くよう、両方に同じ設定を置いています。リポジトリ直下側は `commentTranslate.hover.enabled` を保持したまま追記しました。

## Q. `.vscode/settings.json` はコミットして共有されるか

されません。グローバル除外に `.vscode/` があるためです。

```
$ git check-ignore -v .vscode/settings.json
/Users/yasu/.gitignore_global:2:.vscode/	.vscode/settings.json
```

リポジトリの `.gitignore` には次の指定がありますが、これでは復帰できません。git は「親ディレクトリが除外されているファイルを再包含できない」ためで、ディレクトリ単位の除外（`.vscode/`）が勝ちます。

```
.vscode/*
!.vscode/settings.json
```

共有したい場合の選択肢は2つです。

```bash
# 1) 明示的に追加する（除外を無視して1ファイルだけ追跡）
git add -f 90_samples/.vscode/settings.json

# 2) ~/.gitignore_global の 2 行目 `.vscode/` を外し、リポジトリ側の指定に任せる
```

既存の `launch.json` / `tasks.json` / `extensions.json` も同じ理由で未追跡です（`git ls-files | grep .vscode/` が空）。
※ `git add` はエージェント禁止操作のため、実行は手動で行ってください。

## Q. 既存コードの一括整形はどうするか

設定時点で未整形だったのは52件です（html 24 / ts 23 / json 3 / scss 2、`.md` 除外後・作業中ファイル含む）。

```bash
cd 90_samples
yarn format:check   # 対象の確認のみ
yarn format         # 一括整形
```

整形差分の主な内容は次のとおりです。

- `tsconfig.*.json`: 短い配列が1行に畳まれる（`"include": ["src/**/*.ts"]`）
- `*.ts`: `printWidth: 100` による折り返し、シングルクォート統一
- `*.html`: 制御フローブロック内の字下げ、属性の折り返し

差分が大きいので、コミット単位を分けて「整形のみのコミット」にするのが安全です。

## Q. 他プロジェクトへ同じ設定を入れる手順

1. `yarn add -D --exact prettier`
2. `.prettierrc` を作成（`90_samples/.prettierrc` をコピー。`*.html` の angular parser 指定を必ず含める）
3. `.prettierignore` を作成（ビルド成果物・`*.md`・parser 不明な独自拡張子）
4. `package.json` に `format` / `format:check` を追加
5. `.vscode/extensions.json` の `recommendations` に `esbenp.prettier-vscode` を追加
6. ワークスペースとして開くフォルダ直下の `.vscode/settings.json` に保存時整形を設定
7. `yarn format:check` で対象件数を確認してから `yarn format`
