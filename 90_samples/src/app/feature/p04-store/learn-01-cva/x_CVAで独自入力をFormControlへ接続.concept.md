# CVA で独自入力を FormControl へ接続

## 関数詳細

- `writeValue`: 親の FormControl の値を子へ反映する
- `registerOnChange`: 子の値を親へ返す関数を受け取る
- `registerOnTouched`: 子が操作されたことを親へ伝える関数を受け取る
- `setDisabledState`: 親の disabled 状態を子へ反映する

## どういうケースで使用するか

独自の入力コンポーネントを `formControl` や `formControlName` で使いたい場合。

## 注意点

`NG_VALUE_ACCESSOR` は `multi: true` で登録する。子の値が変わったら `onChange`、操作が終わったら `onTouched` を呼ぶ。

---
---
---
---
---



> <app-simple-input [formControl]="name" /> の [formControl] を子供に渡しているだけですよね。どうやって子供に伝承するのか不思議

その見え方になりますが、実際には `FormControl` を子コンポーネントへ直接渡していません。

```html
<app-simple-input [formControl]="name" />
```

この要素には同時に2つが生成されます。

```text
<app-simple-input>
├─ SimpleInput コンポーネント
└─ FormControlDirective（[formControl] によって付く）
```

`[formControl]="name"` の受取先は `SimpleInput` ではなく、Angular Formsの `FormControlDirective` です。

その後、次の provider を使って両者が接続されます。

```ts
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SimpleInput),
    multi: true,
  },
],
```

これはAngularへ、

> この要素の入力値を扱う部品は `SimpleInput` です

と登録しています。

接続時、Angular Formsはおおよそ次の処理をします。

```text
FormControlDirective
  │
  ├─ writeValue(name.value) ────────────▶ SimpleInput
  │
  ├─ registerOnChange(callback) ────────▶ SimpleInput
  │
  └─ registerOnTouched(callback) ───────▶ SimpleInput
```

値の流れは双方向です。

```text
親 → 子
name.setValue('Angular')
  → FormControlDirective
  → SimpleInput.writeValue('Angular')
  → inputに表示
```

```text
子 → 親
inputイベント
  → SimpleInput.updateValue()
  → this.onChange(value)
  → FormControlDirective
  → nameの値を更新
```

つまり、重要なのは以下です。

```ts
export class SimpleInput implements ControlValueAccessor
```

`ControlValueAccessor` が、Angular Formsと独自コンポーネントの間の変換アダプターになっています。

もし本当に `FormControl` を子へ直接渡す方式なら、子側に次のような `input()` が必要です。

```ts
readonly control = input.required<FormControl<string>>();
```

しかし今回の `SimpleInput` にはそれがありません。`FormControlDirective` と `NG_VALUE_ACCESSOR` が間に入り、値と状態だけを伝えています。実装箇所は [simple-input.ts](./simple-input/simple-input.ts) です。