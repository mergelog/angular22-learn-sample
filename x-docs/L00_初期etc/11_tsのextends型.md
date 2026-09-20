ダックタイピング的な理解

// # <V extends Action> の話

class Test01 {

}

type ABC = { type: string }

function dispatch(abc: ABC) {
  abc.type
}

const toggleABC = {
  type: '[Toggle] Toggle',
  enabled: true,
};

// エラーにはならないが、中で'enabled'は使えない
dispatch(toggleABC)

/*

はい。これは TypeScript の仕様です。

```ts
type Action = {
  type: string;
};

function dispatch(action: Action) {}

const toggleAction = {
  type: '[Toggle] Toggle',
  enabled: true,
};

dispatch(toggleAction); // OK
```

`dispatch` が使うのは `type` だけなので、`enabled` が追加で存在しても安全と判断されます。

一方、オブジェクトを直接書く場合は、スペルミスを検出するために厳しく検査されます。

```ts
dispatch({
  type: '[Toggle] Toggle',
  enabeld: true, // おそらく enabled の書き間違い → エラーにしてくれる
});
```

この仕組みを「余分なプロパティチェック」と呼びます。

ただし実務では、NgRx の Action は `createAction()` が作る Action Creator 経由で生成するので、この挙動を意識して手書きする場面は多くありません。

*/

# <V extends Action>について

「`Action` が含まれていれば」より、**「`Action` が求めるプロパティを持っていれば」**が正確です。

NgRx の `Action` は主にこれです。

```ts
type Action = {
  type: string;
};
```

したがって `V extends Action` は、

```ts
type: string
```

を持つ型ならよい、という意味です。

```ts
{
  type: '[Toggle] Toggle',
  enabled: true,
}
```

`enabled` は追加プロパティで、あってもなくても構いません。