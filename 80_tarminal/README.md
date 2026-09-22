# 80_tarminal

Angular 22、NgRx Store、NgRx SignalStore、Signal、TypeScript の小さな挙動をターミナルで確認するプロジェクト。
ブラウザーは不要。依存パッケージは `90_samples` と同系統。

```bash
cd 80_tarminal
yarn install
yarn start
```

`yarn start` はサンプルを実行し、`127.0.0.1:3200` で待機する。`src/terminal/` の
ファイルを保存すると再実行する。終了は `Ctrl+C`。ビルド結果や Lazy chunk files は表示しない。

一度だけ実行するなら `yarn demo`。Angular CLI の画面を使いたい場合は `yarn serve`。
どちらの常駐コマンドも 3200 番を使うため、同時には起動しない。

新しい例は `src/terminal/examples/` に作り、`src/terminal/main.ts` から関数を呼ぶ。
Angular の `signal` / `computed` は直接使用できる。`inject()` が必要な例では
`createTerminalInjector()` と `runInInjectionContext()` を使う。NgRx Store の例は
`examples/ngrx.ts` を参照。

```bash
yarn typecheck
```
