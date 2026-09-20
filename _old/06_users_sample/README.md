# 06 Users Sample

```bash
npm install
npm start
```

画面の「ユーザーを取得」を押すと、次の順に動きます。

`loadUsers` → `loadUsers$` → `UsersApi.getUsers()` → `loadUsersSuccess` → reducer → Store
