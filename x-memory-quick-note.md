# quick-note

QuickNote（一言メモ）は、物の仕様ではなく、作法について一言で記入していく。

## ▼ NgRX

- Actionはイベントである:
  + Actionを設計するとき、最初に決めたいのは「これは何のイベント（出来事）か」です
  
- Action名:
  + 広く使われている慣習があります。[発生源] 出来事という形
  + 発生源をわざわざ書くのは、同じような出来事でも、どこで起きたかを区別したいから
  + 「タスクの読み込み成功」という出来事は、一覧画面から起こることも、詳細画面から起こることもあります。
    [Task List] Load Tasks Successと[Task Detail] Load Tasks Successのように発生源で分けておくと
    あとから流れを追うときに、どちらの経路だったのかがわかります
  ```ts
  [Task List] Load Tasks
  [Task Detail] Load Tasks
  
  // ↓ Effect側では普通にまとめられます。

  ofType(
    TaskListActions.loadTasks,
    TaskDetailActions.loadTasks
  ),
  ```
