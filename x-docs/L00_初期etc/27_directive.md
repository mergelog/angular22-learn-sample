`@Directive()` は、Angularにそのクラスを「Directiveとして扱う」と知らせるデコレーターです。

ざっくり言うと、

* `@Component()` → HTMLを持つUI部品
* `@Directive()` → 既存の要素やComponentに「振る舞いを追加するもの」

例えば、

```ts
@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
}
```

HTML側では、

```html
<div appHighlight>文字</div>
```

のように使います。

つまり、

> `@Directive()` = 「画面部品そのものではなく、要素に機能・振る舞いを付けるAngularクラス」

です。

なお、`@Component()` は内部的には `@Directive()` の機能を拡張したもの、と考えると理解しやすいです。

