# attacheでデバッグ

## chrome開く。

```
open -na "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir=/tmp/angular22-chrome-debug
```


## launch.json 作成

> "name": "attache" があれば良い
> 尚、使用する場合、起動するプロジェクトでvscodeを開く必要がある

```
{
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ng serve",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: start",
      "url": "http://localhost:4200/"
    },
    {
      "name": "attache",
      "type": "chrome",
      "request": "attach",
      "port": 9222,
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "ng test",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: test",
      "url": "http://localhost:9876/debug.html"
    }
  ]
}
```

ここで localhost:4200 起動

## Angular devtool を使用する場合

  - Angular devtool起動後に、画面を再読み込みすること

## redux devtool を使用する場合

  - "@ngrx-toolkit/core": "22.0.1"が必要
  - SignalStoreの場合、withDevtools の設定も必要

## chromeのコンソールで値を表示

ng.getComponent(document.querySelector('app-learn-10-signal-store-events')).store.count()
