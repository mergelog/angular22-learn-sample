では、SignalStoreはClassic NgRxと比較しながら進めるのが一番理解しやすいです。現在の `@ngrx/signals` では、`signalStore` を中心に `withState / withComputed / withMethods / patchState` を組み合わせるのが基本形です。([NgRx][1])

最初はこの順番で進めます。

1. `SignalStore` はそもそも何か
2. `signalStore()` と `withState()`
3. Stateを読む
4. `patchState()` でStateを更新
5. `withMethods()`
6. `withComputed()`
7. Componentから使う
8. API通信
9. `rxMethod()` とRxJS
10. `withHooks()`
11. `withEntities()`
12. Classic NgRxとの使い分け

最初からAPI通信まで入れると分かりにくくなるので、まずはカウンター程度の最小構成からいきます。

まずSignalStoreを一言で言うと、

> 「Angular Signalsを使って、State・派生値・更新処理をひとまとめにしたStore」

です。

Classic NgRxでは、ざっくり

`Component → dispatch(Action) → Reducer → State → Selector → Component`

でした。

SignalStoreでは基本的には、

`Component → Storeのメソッド → State更新 → Component`

です。

例えばClassic NgRxなら、

`increment Action`
→ `Reducer`
→ `countを+1`

という構造になります。

SignalStoreなら、

`store.increment()`
→ `patchState()`
→ `countを+1`

くらいまで短くできます。

最小構成はこれです。

```ts
import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';

export const CounterStore = signalStore(
  withState({
    count: 0,
  }),

  withMethods((store) => ({
    increment() {
      patchState(store, {
        count: store.count() + 1,
      });
    },
  })),
);
```

ここでまず覚えるのは4つだけです。

| 名前              | 意味                |
| --------------- | ----------------- |
| `signalStore()` | Storeそのものを作る      |
| `withState()`   | Storeが持つデータを定義    |
| `withMethods()` | Storeを操作するメソッドを定義 |
| `patchState()`  | Stateを書き換える       |

つまり、

```ts
withState({
  count: 0
})
```

は、

> このStoreは `count` という状態を持っています。初期値は0です。

という意味です。

そして、

```ts
store.count()
```

なのがかなり重要です。

これは普通の

```ts
store.count
```

ではありません。

`count` がAngularのSignalとして公開されるため、

```ts
store.count()
```

と関数のように呼んで現在値を取得します。

公式ドキュメントでも、`withState` で定義したState sliceはSignalとして扱われ、`withMethods` から `patchState()` で更新する形が基本になっています。([NgRx][1])

まずこの段階では、

> SignalStore = 「Stateを持ったサービスっぽいもの」

くらいの理解で十分です。

ただし普通のServiceと違って、StateがSignalになっていて、変更するとAngular側がリアクティブに追従できる、というのが重要です。

次はこの最小コードをComponentから実際に使って、

```ts
store.count()
store.increment()
```

がそれぞれ何をしているのか、1行ずつ分解しましょう。

[1]: https://ngrx.io/guide/signals/signal-store?utm_source=chatgpt.com "NgRx"

では、Componentから使うところです。

Storeはさっきのこれを使います。

```ts
import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';

export const CounterStore = signalStore(
  withState({
    count: 0,
  }),

  withMethods((store) => ({
    increment() {
      patchState(store, {
        count: store.count() + 1,
      });
    },
  })),
);
```

Component側はこうします。

```ts
import { Component, inject } from '@angular/core';
import { CounterStore } from './counter.store';

@Component({
  selector: 'app-counter',
  template: `
    <p>{{ store.count() }}</p>

    <button (click)="store.increment()">
      +1
    </button>
  `,
  providers: [CounterStore],
})
export class CounterComponent {
  readonly store = inject(CounterStore);
}
```

ここで重要なのは3箇所です。

まず、

```ts
providers: [CounterStore]
```

これによって、このComponentで `CounterStore` を使えるようにしています。

次に、

```ts
readonly store = inject(CounterStore);
```

これは、

> AngularのDIからCounterStoreを取得する

という意味です。

普通のServiceで、

```ts
private readonly userService = inject(UserService);
```

とするのとほぼ同じ感覚です。

そしてHTML側。

```html
<p>{{ store.count() }}</p>
```

ここがSignalらしいところです。

`count` は普通の数値プロパティではなくSignalなので、

```ts
store.count()
```

と書きます。

イメージとしては、

```text
store.count
↓
「countというSignalそのもの」

store.count()
↓
「現在のcountの値」
```

です。

初期状態は、

```ts
withState({
  count: 0,
})
```

なので、画面には最初、

```text
0
```

と表示されます。

ボタンを押すと、

```html
(click)="store.increment()"
```

が実行されます。

つまりComponentから、

```ts
store.increment()
```

を呼びます。

するとStore側の、

```ts
increment() {
  patchState(store, {
    count: store.count() + 1,
  });
}
```

が動きます。

ここを順番に見ると、

```ts
store.count()
```

で現在値を取得。

たとえば現在が `0` なら、

```ts
store.count() + 1
```

は、

```text
0 + 1 = 1
```

です。

その新しい値を、

```ts
patchState(store, {
  count: 1,
});
```

でStoreに反映します。

すると `count` がSignalなので、Angularが変更を検知して、

```html
<p>{{ store.count() }}</p>
```

も自動的に更新されます。

全体の流れはこうです。

```text
ボタンをクリック
    ↓
store.increment()
    ↓
patchState()
    ↓
count: 0 → 1
    ↓
Signalが変更される
    ↓
画面が自動更新
    ↓
1 が表示される
```

Classic NgRxと比べると、違いがかなり見えます。

Classic NgRxなら、

```text
Component
↓
dispatch(increment())
↓
Action
↓
Reducer
↓
State更新
↓
Selector
↓
Component
```

SignalStoreなら、

```text
Component
↓
store.increment()
↓
patchState()
↓
State更新
↓
Component
```

かなり直接的です。

なのでSignalStoreを学習するときは、まず

```ts
store.count()
```

= Stateを読む

```ts
store.increment()
```

= Storeに処理を依頼する

```ts
patchState()
```

= Stateを変更する

この3つを押さえるとかなり楽です。

次は `withComputed()` に進むと、SignalStoreらしさがさらに分かります。

例えば `count` が `3` のとき、

```text
doubleCount = 6
```

のような「Stateから自動計算される値」を作ります。

次は `withComputed()` です。ここは「Stateから別の値を自動計算する仕組み」と考えると分かりやすいです。

さっきの `CounterStore` に `doubleCount` を追加します。

```ts
import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

export const CounterStore = signalStore(
  withState({
    count: 0,
  }),

  withComputed((store) => ({
    doubleCount: computed(() => store.count() * 2),
  })),

  withMethods((store) => ({
    increment() {
      patchState(store, {
        count: store.count() + 1,
      });
    },
  })),
);
```

公式ドキュメントでも、`withComputed()` は既存のState Signalなどを使って「派生したSignal」をStoreに追加する仕組みとして定義されています。([NgRx][1])

ここで、

```ts
withComputed((store) => ({
  doubleCount: computed(() => store.count() * 2),
}))
```

を分解します。

`store.count()` が現在の `count` です。

たとえば、

```text
count = 3
```

なら、

```ts
store.count() * 2
```

なので、

```text
doubleCount = 6
```

になります。

重要なのは、`doubleCount` を自分で更新しないことです。

つまり、こういうStateにはしません。

```ts
withState({
  count: 0,
  doubleCount: 0,
})
```

これだと `count` を変更するたびに、

```ts
patchState(store, {
  count: 1,
  doubleCount: 2,
});
```

のように両方更新しなければなりません。

さらに次に、

```ts
patchState(store, {
  count: 2,
  doubleCount: 4,
});
```

となります。

これは危険です。

なぜなら間違えて、

```ts
patchState(store, {
  count: 2,
  doubleCount: 6,
});
```

としてしまう可能性があるからです。

本来、

```text
count = 2
doubleCount = 4
```

であるべきなのに、State内部で矛盾します。

そこで、

```ts
withState({
  count: 0,
})
```

だけを「本物のState」として持ち、

```ts
doubleCount: computed(
  () => store.count() * 2
)
```

は自動計算させます。

流れはこうです。

```text
count = 1
   ↓
doubleCount = 2

count = 2
   ↓
doubleCount = 4

count = 3
   ↓
doubleCount = 6
```

Componentでは普通に、

```html
<p>count: {{ store.count() }}</p>
<p>double: {{ store.doubleCount() }}</p>

<button (click)="store.increment()">
  +1
</button>
```

と使えます。

`increment()` を押すと、

```text
store.increment()
      ↓
count
0 → 1
      ↓
doubleCountも自動再計算
0 → 2
      ↓
画面も更新
```

となります。

ここでSignalStoreの3つを整理すると、かなり重要な区別があります。

| SignalStore      | 役割            | 例             |
| ---------------- | ------------- | ------------- |
| `withState()`    | 元となるデータ       | `count`       |
| `withComputed()` | Stateから計算できる値 | `doubleCount` |
| `withMethods()`  | Stateを操作する処理  | `increment()` |

つまり、

```text
State
↓
Computed
```

という一方向です。

`doubleCount` から `count` を変更するわけではありません。

実務っぽい例にするとさらに分かりやすいです。

例えばユーザー一覧を持っているStoreなら、

```ts
withState({
  users: [],
})
```

が本体Stateです。

そして、

```ts
withComputed((store) => ({
  userCount: computed(
    () => store.users().length
  ),
}))
```

とできます。

すると、

```text
users
[
  Tanaka,
  Suzuki,
  Sato
]

↓ 自動計算

userCount
3
```

となります。

Classic NgRxを知っているなら、`withComputed()` はかなりざっくり言えば「Selectorに近い役割」です。

```text
Classic NgRx

State
 ↓
Selector
 ↓
Component
```

に対して、

```text
SignalStore

withState
 ↓
withComputed
 ↓
Component
```

です。

厳密にはSelectorと完全に同じ概念ではありませんが、学習初期は、

> `withComputed()` ≒ 「SignalStore版のSelector的なもの」

と捉えて問題ありません。

そして現在のNgRxでは、`withComputed()` の中で明示的にAngularの `computed()` を返すだけでなく、単純な関数を返すとcomputed signalとして扱われる書き方も公式に用意されています。まずは今のように `computed(() => ...)` と明示する書き方で覚える方が理解しやすいです。([NgRx][1])

ここまででSignalStoreの骨格はほぼ見えています。

```text
withState
   ↓
データを持つ

withComputed
   ↓
データから値を導く

withMethods
   ↓
データを変更する
```

次は少し実務寄りにして、`users: User[]` を持つStoreを作り、

```ts
store.users()
store.userCount()
store.addUser()
```

までやると、カウンターではなく「業務アプリでSignalStoreをどう使うか」が見えてきます。

[1]: https://ngrx.io/guide/signals/signal-store?utm_source=chatgpt.com "NgRx"


では、カウンターから一段だけ実務寄りにします。今回は `User[]` をStateに持たせて、「一覧を読む・件数を計算する・追加する」までです。SignalStoreの基本構造は、現行のNgRx公式ドキュメントでも `withState` → `withComputed` → `withMethods` という組み合わせが中心です。([NgRx][1])

まず `User` 型を作ります。

```ts
export type User = {
  id: number;
  name: string;
};
```

Storeはこうします。

```ts
import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

type UsersState = {
  users: User[];
};

const initialState: UsersState = {
  users: [],
};

export const UsersStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    userCount: computed(
      () => store.users().length
    ),
  })),

  withMethods((store) => ({
    addUser(user: User) {
      patchState(store, {
        users: [...store.users(), user],
      });
    },
  })),
);
```

まず `withState`。

```ts
withState(initialState)
```

その中身は、

```ts
{
  users: []
}
```

です。

つまりStoreが持っている本当のStateは今のところ、

```text
users
```

だけです。

Componentからは、

```ts
store.users()
```

で取得できます。

たとえば、

```ts
store.users()
```

の結果が、

```ts
[
  { id: 1, name: 'Tanaka' },
  { id: 2, name: 'Suzuki' },
]
```

のようになります。

次に、

```ts
withComputed((store) => ({
  userCount: computed(
    () => store.users().length
  ),
}))
```

です。

これは、

```text
users
↓
人数を数える
↓
userCount
```

という関係です。

例えば、

```ts
users = [
  Tanaka,
  Suzuki,
  Sato
]
```

なら、

```ts
store.userCount()
```

は、

```text
3
```

です。

ここで大事なのは、

```ts
userCount
```

をStateとして保存していないことです。

つまり、

```ts
type UsersState = {
  users: User[];
  userCount: number;
};
```

とはしません。

なぜなら `userCount` は、

```ts
users.length
```

から必ず計算できるからです。

そのため、

```text
users = 元データ

userCount = 元データから導出できる値
```

という分離にします。

次に `addUser()`。

```ts
withMethods((store) => ({
  addUser(user: User) {
    patchState(store, {
      users: [...store.users(), user],
    });
  },
}))
```

ここは少し重要です。

例えば現在、

```ts
store.users()
```

が、

```ts
[
  { id: 1, name: 'Tanaka' }
]
```

だったとします。

そこへ、

```ts
store.addUser({
  id: 2,
  name: 'Suzuki',
});
```

を実行します。

内部では、

```ts
users: [
  ...store.users(),
  user
]
```

となります。

つまり、

```text
今までのusers
+
新しいuser
```

です。

結果、

```ts
[
  { id: 1, name: 'Tanaka' },
  { id: 2, name: 'Suzuki' },
]
```

になります。

`patchState()` はSignalStoreのState更新に使う公式の基本APIです。また、SignalStoreのStateはデフォルトでは外部から直接変更できない「protected state」になっており、Storeのmethod経由で変更する設計が推奨されています。([NgRx][1])

Component側はこんな感じです。

```ts
import { Component, inject } from '@angular/core';
import { UsersStore } from './users.store';

@Component({
  selector: 'app-users',
  template: `
    <p>ユーザー数: {{ store.userCount() }}</p>

    @for (user of store.users(); track user.id) {
      <p>{{ user.name }}</p>
    }

    <button (click)="addUser()">
      ユーザー追加
    </button>
  `,
  providers: [UsersStore],
})
export class UsersComponent {
  readonly store = inject(UsersStore);

  addUser() {
    this.store.addUser({
      id: 1,
      name: 'Tanaka',
    });
  }
}
```

処理の流れを追うとこうなります。

```text
初期状態

users = []
userCount = 0
```

ボタンを押します。

```text
Component

store.addUser(...)
        ↓
```

Storeのmethodが呼ばれます。

```text
addUser()
   ↓
patchState()
   ↓
usersが更新される
```

すると、

```text
users

[]
↓
[
  Tanaka
]
```

となります。

`users()` が変わったので、

```ts
computed(() => store.users().length)
```

も自動的に再計算されます。

```text
userCount

0
↓
1
```

そしてComponentの、

```html
{{ store.userCount() }}
```

や、

```html
@for (user of store.users(); ...)
```

も更新されます。

つまり全体としては、

```text
Component
    ↓
store.addUser()
    ↓
withMethods
    ↓
patchState()
    ↓
withState の users が更新
    ↓
withComputed の userCount が再計算
    ↓
Componentが更新
```

です。

ここまで理解できると、SignalStoreの基本形はかなり見えています。

```text
withState
「何を持つか」

withComputed
「Stateから何を導くか」

withMethods
「Stateをどう変更するか」
```

実際の業務アプリでは、この `UsersState` が、

```ts
type UsersState = {
  users: User[];
  isLoading: boolean;
  error: string | null;
};
```

のようになってきます。

そして次に自然に出てくるのが、

```ts
store.loadUsers()
```

です。

つまり、

```text
Component
↓
store.loadUsers()
↓
API通信
↓
取得したUser[]をpatchState
↓
画面更新
```

です。

ここからがSignalStoreとRxJSの接続部分なので、次はまず難しい `rxMethod()` を使わず、普通の `async loadUsers()` でAPI通信するところから進めるのが分かりやすいです。NgRx公式も、単純な非同期処理は `withMethods()` 内でPromiseベースに書ける一方、より複雑なリアクティブ処理では `rxMethod()` を使う構成を案内しています。([NgRx][1])

[1]: https://ngrx.io/guide/signals/signal-store?utm_source=chatgpt.com "NgRx"



では次に、SignalStoreでAPI通信を入れます。まずは `rxMethod()` を使わず、普通の `async/await` で理解します。公式でも、単純な非同期処理は `withMethods()` 内の `async` メソッドとして書けます。([NgRx][1])

例えばAPIサービスがこれだとします。

```ts id="h3c02j"
@Injectable({
  providedIn: 'root',
})
export class UsersApi {
  async getUsers(): Promise<User[]> {
    return [
      { id: 1, name: 'Tanaka' },
      { id: 2, name: 'Suzuki' },
    ];
  }
}
```

SignalStore側です。

```ts id="kdzrtm"
import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';

type UsersState = {
  users: User[];
  isLoading: boolean;
  error: string | null;
};

const initialState: UsersState = {
  users: [],
  isLoading: false,
  error: null,
};

export const UsersStore = signalStore(
  withState(initialState),

  withMethods((store, api = inject(UsersApi)) => ({
    async loadUsers() {
      patchState(store, {
        isLoading: true,
        error: null,
      });

      try {
        const users = await api.getUsers();

        patchState(store, {
          users,
          isLoading: false,
        });
      } catch {
        patchState(store, {
          error: 'ユーザー取得に失敗しました',
          isLoading: false,
        });
      }
    },
  })),
);
```

まずここです。

```ts id="w27jsv"
withMethods((store, api = inject(UsersApi)) => ({
```

`withMethods()` の中ではAngularのDIが使えます。

つまり、

```ts id="3zypoc"
api = inject(UsersApi)
```

によって、StoreからAPIサービスを利用できます。これは公式ドキュメントでも使われている形です。([NgRx][1])

次に、

```ts id="v6a8k4"
async loadUsers() {
```

です。

Componentから、

```ts id="7akoi5"
store.loadUsers();
```

を呼ぶとAPI通信が始まります。

その直後に、

```ts id="mp9vaw"
patchState(store, {
  isLoading: true,
  error: null,
});
```

としています。

Stateはこう変わります。

```text id="e5r0e8"
通信前

users      = []
isLoading  = false
error      = null


通信開始

users      = []
isLoading  = true
error      = null
```

つまり `isLoading` は、

> 「今API通信しています」

という状態です。

Componentでは、

```html id="k91xkp"
@if (store.isLoading()) {
  <p>読み込み中...</p>
}
```

のように使えます。

次です。

```ts id="m08lkx"
const users = await api.getUsers();
```

ここでAPIの結果を待ちます。

たとえば結果が、

```ts id="dg5tca"
[
  { id: 1, name: 'Tanaka' },
  { id: 2, name: 'Suzuki' },
]
```

だったとします。

すると、

```ts id="z32z21"
patchState(store, {
  users,
  isLoading: false,
});
```

によってStateがこうなります。

```text id="r49alu"
users
[]
↓
[
  Tanaka,
  Suzuki
]

isLoading
true
↓
false
```

SignalなのでComponent側も自動的に変わります。

```text id="v5cq32"
API通信開始

isLoading = true
↓
「読み込み中...」表示


API通信完了

users = [Tanaka, Suzuki]
isLoading = false
↓
一覧表示
```

Component全体ならこうです。

```ts id="mljgwh"
@Component({
  selector: 'app-users',
  template: `
    <button (click)="store.loadUsers()">
      読み込み
    </button>

    @if (store.isLoading()) {
      <p>読み込み中...</p>
    }

    @if (store.error()) {
      <p>{{ store.error() }}</p>
    }

    @for (user of store.users(); track user.id) {
      <p>{{ user.name }}</p>
    }
  `,
  providers: [UsersStore],
})
export class UsersComponent {
  readonly store = inject(UsersStore);
}
```

ここまでの流れを一本につなげると、

```text id="f1fw7a"
Component

store.loadUsers()
      ↓

SignalStore

isLoading = true
      ↓

UsersApi

getUsers()
      ↓
      ↓ API待ち
      ↓

取得成功
      ↓

patchState()

users = API結果
isLoading = false
      ↓

Signal更新
      ↓

Component自動更新
```

です。

Classic NgRxと比較するとかなり違います。

Classic NgRxでは典型的に、

```text id="605lkb"
Component
↓
dispatch(loadUsers())
↓
Effect
↓
API
↓
dispatch(loadUsersSuccess())
↓
Reducer
↓
State
```

でした。

SignalStoreだと今回、

```text id="ocub9i"
Component
↓
store.loadUsers()
↓
API
↓
patchState()
↓
State
```

です。

つまりClassic NgRxの、

```text id="um4x0f"
Action
Effect
Reducer
```

という分業を、SignalStoreではかなりStore内部にまとめられます。

ここはSignalStoreを理解するうえで重要です。

ただし、

> 「だったら全部 `async/await` でいいじゃん」

とはなりません。

例えば検索欄で、

```text id="96ai6n"
t
↓
ta
↓
tan
↓
tana
↓
tanaka
```

と高速に入力された場合、

「古いAPI通信をキャンセルして最新だけ使いたい」

というケースが出ます。

ここで以前やった、

```ts id="qd9j1k"
switchMap
```

が必要になります。

そこでSignalStoreには、

```ts id="ozuy84"
rxMethod()
```

があります。

公式でも、単純なPromiseベースの非同期処理は `async` メソッド、より複雑なリアクティブ処理では `rxMethod()` + RxJSを使う形が案内されています。([NgRx][1])

なので次はいよいよ、

```text id="oibawj"
SignalStore
+
rxMethod
+
switchMap
```

です。

ここは最近やっていた `switchMap / mergeMap / concatMap / exhaustMap` がそのまま繋がります。

[1]: https://ngrx.io/guide/signals/signal-store?utm_source=chatgpt.com "NgRx"


では次に、`rxMethod()` を使います。

ここはまず「`rxMethod` は何者か」を掴むのが先です。

`rxMethod()` は、

> 「SignalStoreのメソッドとして、RxJSの `pipe()` をそのまま使えるようにするもの」

と考えてください。

公式でも、複雑な非同期処理やリアクティブな副作用では `rxMethod()` を使う形が案内されています。([NgRx][1])

例えば検索APIを考えます。

```ts
searchUsers(keyword: string): Observable<User[]> {
  return this.http.get<User[]>(
    `/api/users?keyword=${keyword}`
  );
}
```

SignalStoreはこう書けます。

```ts
import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';

import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  pipe,
  switchMap,
  tap,
} from 'rxjs';

import { tapResponse } from '@ngrx/operators';

export const UsersStore = signalStore(
  withState({
    users: [] as User[],
    isLoading: false,
  }),

  withMethods((store, api = inject(UsersApi)) => ({
    searchUsers: rxMethod<string>(
      pipe(
        debounceTime(300),

        distinctUntilChanged(),

        tap(() => {
          patchState(store, {
            isLoading: true,
          });
        }),

        switchMap((keyword) =>
          api.searchUsers(keyword).pipe(
            tapResponse({
              next: (users) => {
                patchState(store, {
                  users,
                  isLoading: false,
                });
              },

              error: () => {
                patchState(store, {
                  isLoading: false,
                });
              },
            })
          )
        )
      )
    ),
  })),
);
```

いきなり全部見ると分かりにくいので、最初はここだけ見てください。

```ts
searchUsers: rxMethod<string>(
  pipe(
    ...
  )
)
```

これは、

```ts
searchUsers(keyword: string)
```

という普通のメソッドに近いです。

Componentからは、

```ts
store.searchUsers('tanaka');
```

のように呼べます。

ただし普通のメソッドとの違いは、

```ts
rxMethod<string>(
  pipe(
    ...
  )
)
```

の中にRxJSの処理を書けることです。

つまり、

```text
store.searchUsers('tanaka')
        ↓
      RxJS
        ↓
      pipe()
        ↓
    switchMap
        ↓
       API
```

となります。

ここで以前学習した `switchMap` がそのまま登場します。

```ts
switchMap((keyword) =>
  api.searchUsers(keyword)
)
```

例えばユーザーが検索欄に、

```text
t
ta
tan
tana
tanaka
```

と入力したとします。

それぞれ、

```ts
store.searchUsers('t');
store.searchUsers('ta');
store.searchUsers('tan');
store.searchUsers('tana');
store.searchUsers('tanaka');
```

と呼ばれるイメージです。

`switchMap` なので、

```text
t       → API通信開始
ta      → tをキャンセルしてAPI通信
tan     → taをキャンセル
tana    → tanをキャンセル
tanaka  → tanaをキャンセル
```

となります。

最終的には、

```text
tanaka
```

の検索結果だけを使います。

つまり、以前やった

```text
switchMap
=
新しい要求が来たら
古い処理をキャンセル
```

が、SignalStoreでもそのまま使われています。

ここが重要です。

`rxMethod()` 自体がAPI通信するわけではありません。

役割分担はこうです。

```text
rxMethod
↓
RxJSを使えるメソッドを作る

switchMap
↓
古い通信を切り替える

api.searchUsers()
↓
実際にHTTP通信する

tapResponse
↓
成功・失敗を処理する

patchState
↓
StoreのStateを更新する
```

次に、

```ts
debounceTime(300)
```

があります。

これは、

> 入力されてから300ms待つ

という意味です。

例えば人間が高速で、

```text
t
ta
tan
tana
tanaka
```

と入力しても、毎文字APIを叩くのではなく、

```text
t
 ↓
ta
 ↓
tan
 ↓
tana
 ↓
tanaka
      ↓
   300ms待つ
      ↓
API通信
```

という動きにできます。

そして、

```ts
distinctUntilChanged()
```

は、

> 前回と同じ値なら流さない

です。

例えば、

```text
tanaka
tanaka
tanaka
```

と同じ検索語が続いた場合、無駄な処理を減らせます。

この3つは検索処理では非常によく相性がいいです。

```ts
debounceTime(300),
distinctUntilChanged(),
switchMap(...)
```

意味としては、

```text
少し待つ
↓
前回と同じなら無視
↓
新しい検索なら古い通信を切り替える
↓
API
```

です。

次に、

```ts
tapResponse({
  next: (users) => {
    ...
  },

  error: () => {
    ...
  },
})
```

です。

これはNgRxが提供している、Observableの成功・失敗などを安全に処理するためのOperatorです。公式もAPIレスポンス処理では `tapResponse` を推奨しています。([NgRx][2])

成功すると、

```ts
next: (users) => {
  patchState(store, {
    users,
    isLoading: false,
  });
}
```

なので、

```text
API成功
↓
usersをStateへ保存
↓
isLoading = false
```

となります。

全体を一本につなげると、

```text
Component

store.searchUsers('tanaka')
        ↓
      rxMethod
        ↓
 debounceTime(300)
        ↓
distinctUntilChanged()
        ↓
      switchMap
        ↓
   UsersApi
        ↓
  HTTPリクエスト
        ↓
   tapResponse
        ↓
   patchState
        ↓
 usersが更新
        ↓
 Component更新
```

です。

ここで、前回の `async/await` との違いを整理するとかなり重要です。

| 方法                        | 向いている処理          |
| ------------------------- | ---------------- |
| `async/await`             | 単純な「呼ぶ→待つ→結果を保存」 |
| `rxMethod()`              | RxJSで制御したい処理     |
| `rxMethod() + switchMap`  | 最新の要求だけ使いたい      |
| `rxMethod() + concatMap`  | 順番に処理したい         |
| `rxMethod() + exhaustMap` | 処理中の連打を無視したい     |
| `rxMethod() + mergeMap`   | 並列で全部処理したい       |

つまり、最近学習した

```text
switchMap
mergeMap
concatMap
exhaustMap
```

はClassic NgRx Effect専用ではありません。

RxJS Operatorなので、

```text
Classic NgRx Effects
でも使う

SignalStore rxMethod
でも使う

ComponentのObservable
でも使う
```

という位置づけです。

そして `rxMethod()` にはもう1つかなり重要な特徴があります。

普通の値だけでなく、SignalやObservableも渡せます。例えばSignalを渡した場合、そのSignalが変化するたびにRxJSのパイプラインが実行されます。さらに、Injection Contextに結び付いた `rxMethod()` は、Injector破棄時に自動的にクリーンアップされます。([NgRx][2])

今の段階ではそこまで広げなくて大丈夫です。

まずは、

```text
rxMethod()
=
「SignalStoreのメソッドをRxJS化する」
```

と覚えるのが一番重要です。

次は、このコードの中でも特に分かりにくい

```ts
searchUsers: rxMethod<string>(
  pipe(
    switchMap((keyword) => ...)
  )
)
```

について、「`keyword` はどこから来たのか？」まで1行ずつ追うと、`rxMethod` がかなり腑に落ちます。

[1]: https://ngrx.io/guide/signals/signal-store?utm_source=chatgpt.com "NgRx"
[2]: https://ngrx.io/guide/signals/rxjs-integration?utm_source=chatgpt.com "NgRx"


今回はここだけに集中します。

```ts
searchUsers: rxMethod<string>(
  pipe(
    switchMap((keyword) =>
      api.searchUsers(keyword)
    )
  )
)
```

疑問になるのは、

```ts
(keyword) =>
```

の `keyword` はどこから来たのか、です。

答えは単純で、Componentから渡したこれです。

```ts
store.searchUsers('tanaka');
```

この `'tanaka'` がRxJSのパイプラインに流れ込み、

```ts
switchMap((keyword) => ...)
```

の `keyword` に入ります。NgRx公式でも、`rxMethod` に通常の値を渡すと、その値がリアクティブな処理チェーンへ流れる仕様になっています。([NgRx][1])

つまり、

```ts
store.searchUsers('tanaka');
```

↓

```ts
rxMethod<string>(
```

↓

```ts
switchMap((keyword) => {
```

この時点で、

```ts
keyword === 'tanaka'
```

です。

なので実質的には、

```ts
api.searchUsers('tanaka')
```

が実行されています。

流れをそのまま書くと、

```text
Component

store.searchUsers('tanaka')
                │
                │ 'tanaka'
                ▼
rxMethod<string>
                │
                │ 'tanaka'
                ▼
pipe(...)
                │
                │ 'tanaka'
                ▼
switchMap(keyword => ...)
                │
                │ keyword = 'tanaka'
                ▼
api.searchUsers(keyword)
                │
                ▼
api.searchUsers('tanaka')
```

です。

ここで `<string>` の意味も分かります。

```ts
rxMethod<string>
```

これは、

> このrxMethodには `string` 型の値を流します

という型指定です。

だから、

```ts
store.searchUsers('tanaka');
```

はOK。

```ts
store.searchUsers('suzuki');
```

もOKです。

一方、

```ts
store.searchUsers(123);
```

は型エラーになります。

つまり普通の関数でいう、

```ts
function searchUsers(keyword: string) {
```

の、

```ts
keyword: string
```

に近い役割を、

```ts
rxMethod<string>
```

の `<string>` が担っています。

ただし、普通の関数と `rxMethod` には大きな違いがあります。

普通の関数なら、

```ts
searchUsers('tanaka');
```

を呼んだら、

```text
関数開始
↓
処理
↓
終了
```

です。

`rxMethod` は、中にRxJSのパイプラインがあります。

イメージとしては、

```text
searchUsers()
という入口
      ↓
 ┌─────────────┐
 │ RxJSの通り道 │
 │             │
 │ debounceTime│
 │      ↓      │
 │ switchMap   │
 │      ↓      │
 │ API         │
 └─────────────┘
```

になっています。

そこで、

```ts
store.searchUsers('t');
store.searchUsers('ta');
store.searchUsers('tan');
```

と呼ぶと、

```text
't'
 ↓
RxJS


'ta'
 ↓
RxJS


'tan'
 ↓
RxJS
```

と、呼び出した値が次々と同じリアクティブな処理へ入っていきます。

ここで `switchMap` が意味を持ちます。

```ts
searchUsers: rxMethod<string>(
  pipe(
    switchMap((keyword) =>
      api.searchUsers(keyword)
    )
  )
)
```

こう呼んだとします。

```ts
store.searchUsers('t');

store.searchUsers('ta');

store.searchUsers('tanaka');
```

すると、

```text
't'
 ↓
switchMap
 ↓
API('t') 開始


'ta' が来た
 ↓
switchMap
 ↓
't' の購読を解除
 ↓
API('ta') 開始


'tanaka' が来た
 ↓
switchMap
 ↓
'ta' の購読を解除
 ↓
API('tanaka') 開始
```

となります。

これはまさに、以前やった `switchMap` と同じです。

ここでかなり重要な理解があります。

`keyword` を作っているのは `switchMap` ではありません。

```ts
switchMap((keyword) => ...)
```

というコードだけを見ると、

「突然 `keyword` が出てきた」

ように見えますが、実際には、

```text
store.searchUsers('tanaka')
                  ↑
                  これ
```

がRxJSを流れて、

```ts
switchMap((keyword) => ...)
           ↑
           ここ
```

に到着しただけです。

RxJSで既に見た、

```ts
of(1, 2, 3).pipe(
  map((x) => x * 2)
)
```

と本質的に同じです。

この場合も、

```ts
(x)
```

は突然生まれたわけではなく、

```ts
of(1, 2, 3)
```

から流れてきた、

```text
1
2
3
```

ですよね。

`rxMethod` も同じ感覚です。

```ts
store.searchUsers('tanaka')
```

が、

```ts
of('tanaka')
```

のようにRxJSへ値を流す入口になっている、と考えるとかなり分かりやすいです。

ただし、これは理解のためのイメージであって、`rxMethod` が内部で毎回 `of()` を作っているという意味ではありません。

さらに、

```ts
pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((keyword) => ...)
)
```

なら、値は順番にこう流れます。

```text
store.searchUsers('tanaka')
        │
        │ 'tanaka'
        ▼
debounceTime(300)
        │
        │ 'tanaka'
        ▼
distinctUntilChanged()
        │
        │ 'tanaka'
        ▼
switchMap(keyword => ...)
        │
        │ keyword = 'tanaka'
        ▼
api.searchUsers('tanaka')
```

つまりRxJS Operatorは、基本的に「前から流れてきた値を受け取る」と考えればよいです。

これはかなり大事です。

```ts
rxMethod<string>(
  pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((keyword) => ...)
  )
)
```

を見たら、

```text
stringが入口から入る

    ↓

debounceTime
stringが通過

    ↓

distinctUntilChanged
stringが通過

    ↓

switchMap
そのstringをkeywordとして受け取る
```

と読めます。

ここまで来ると、`rxMethod` の正体もかなり単純化できます。

```text
普通のmethod

store.searchUsers('tanaka')
        ↓
普通の処理
```

に対して、

```text
rxMethod

store.searchUsers('tanaka')
        ↓
RxJSへ 'tanaka' を流す
        ↓
pipe(...)
        ↓
Operatorを順番に通る
```

です。

なので今の段階では、

> `rxMethod<T>` = 「T型の値をRxJSのpipeに流し込めるStoreメソッド」

と覚えるとかなり正確です。`rxMethod` は通常値だけでなくSignalやObservableも入力として受け取れるため、厳密にはもう少し高機能ですが、それは次の段階で十分です。([NgRx][1])

次はこの流れのまま、かなり重要な

```ts
store.searchUsers(searchText)
```

と

```ts
store.searchUsers(searchTextSignal)
```

の違いをやると、「`rxMethod` がなぜ普通のメソッドではなくリアクティブメソッドと呼ばれるのか」が分かります。

[1]: https://ngrx.io/guide/signals/rxjs-integration?utm_source=chatgpt.com "NgRx"
