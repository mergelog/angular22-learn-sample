# 02_hello-world

01_hello-world-srp1 の続き。テーマは **変数名の末尾に付く `$`（Observable の目印）が、
実際どこに出てくるのか** です。

`$` は Finnish notation と呼ばれる命名慣習で、言語仕様上の意味はありません。
「この変数は Observable なので `.pipe()` / `.subscribe()` できる」という読み手向けの目印です。
Signal には付けないので、両者が混ざるコードで見分けが付きます。

Signals 移行後の Angular では、コンポーネントの `store.select()` が `selectSignal()` に置き換わり、
`$` の出現箇所はかなり減りました。それでも残る 3 パターンをこのサンプルに入れてあります。

## (1) Effect 内でストリームを一旦変数に置く

`src/app/core/store/app.effects.ts`

- `actions$` … `inject(Actions)` の戻り値。`Actions` は `Observable` のサブクラスかつ injectable
- `isOn$` … `store.select(...).pipe(take(1))` を名前付きで切り出したもの

01 では一息に繋いでいた部分を分解しています。動作は同じですが、ネストが深くなるほど
「今どのストリームを操作しているか」が追いにくくなるため、意味の区切りで名前を付けます。

## (2) 非同期処理を返すサービスの戻り値を束ねる

同じく `app.effects.ts` の `color$`。

`ColorSyncService.syncColor()` は `Observable<string>` を返すだけで、呼んだ時点では何も起きません。
実際に処理が走るのは購読された瞬間です（cold observable）。
「呼んだ＝実行された」ではないことが、`$` を付けると意識しやすくなります。

## (3) Signal から Observable 側へ戻す

`src/app/features/color/components/color-picker-form/color-picker-form.ts`

- `pickedColor$` … `toObservable(this.pickedColor)`
- `backgroundColor$` … `store.select()` + `async` パイプ（Signals 移行前の書き方）

`<input type="color">` はドラッグ中に大量の input イベントを吐きます。そのまま dispatch すると
1 回の操作で何十ものアクションが流れるので間引きたいのですが、**Signal には `debounceTime` に
あたる時間軸の演算子がありません**。そこで `toObservable()` で Observable に戻し、
RxJS 側で `debounceTime` / `distinctUntilChanged` を掛けてから dispatch しています。

`toObservable()` は購読時に「今の値」も流すため、そのままだと起動直後に一度 dispatch されます。
`skip(1)` で初回だけ捨てているのはそのためです。

`backgroundColor$` は比較用です。`app.ts` では同じ値を `selectSignal()` で取っており、
そちらには `$` が付きません。新規に書くなら `selectSignal` 側を使います。

## 動きの確認

- ボタンを押す → Effect 経由で色が変わる（01 と同じ）
- カラーピッカーをドラッグ → 手を止めて 200ms 後に 1 回だけ dispatch される

入力中の signal の値と、store に入った値を並べて表示しているので、
ドラッグ中は前者だけが動き、間引き後に後者が追いつく様子が見えます。

```bash
npm install
npm start
```
