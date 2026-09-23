# params変更時にObservableを切り替える

## 関数詳細

`rxResource()` は `params` 内で読んだ `userId` を追跡する。`userId` が変わると、それまでの Observable の購読を解除し、新しい値を引数にして `stream` を実行する。

## どういうケースで使用するか

ユーザーIDや検索条件などの Signal に応じて、HTTP APIから非同期データを取得するとき。

## 注意点

`stream` は Observable を返す必要がある。波括弧を使うなら `return this.userService.getUser(userId)` と書く。同じ値を再設定しても再取得されないため、同じ条件で取り直す場合は `userResource.reload()` を使う。
