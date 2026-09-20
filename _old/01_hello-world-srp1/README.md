# 01_hello-world

Angular 22 と NgRx の最小サンプルです。

- ボタンを押すと `toggle` state の `isOn` が reducer で切り替わります。
- Effect が `ColorSyncService` を呼び出し（副作用の模擬）、完了後に `color` state を更新します。
- 下の色付き div は `color` state だけを参照します。

```bash
npm install
npm start
```
