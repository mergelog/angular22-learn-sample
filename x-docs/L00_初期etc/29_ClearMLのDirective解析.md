これはかなり「実戦のAngular」です。

特に、さっきの `@Directive()` の説明と直結する良い例になっています。

このコードの

```ts
@Directive()
export abstract class ExperimentCompareBase
  extends ExperimentCompareDetailsBase
  implements OnDestroy, AfterViewInit {
```

は、一般的な

```ts
@Directive({
  selector: '[appHighlight]'
})
```

のような「HTMLに振る舞いを追加するDirective」とは少し用途が違います。

ここでは、

> Angularの機能を使える「抽象基底クラス」を作るための `@Directive()`

として使われています。

つまり、この `ExperimentCompareBase` 自体をHTMLに置くわけではありません。

```text
ExperimentCompareDetailsBase
        ↑ extends
ExperimentCompareBase   ← 今見ている巨大クラス
        ↑ extends
実際のComponent
```

という継承用の土台です。

だから、

```ts
@Directive()
```

には `selector` すらありません。

このクラスを見ると、なぜAngular管理下に置きたいのかも分かります。

```ts
private router = inject(Router);
protected store = inject(Store);

@ViewChildren('treeCardBody')
treeCardBodies: QueryList<ElementRef<HTMLDivElement>>;

@HostListener('window:resize')
afterResize() {
  ...
}

ngAfterViewInit() {
  ...
}

ngOnDestroy() {
  ...
}
```

Angularの

* DI (`inject`)
* `@ViewChildren`
* `@HostListener`
* Lifecycle
* Change Detection

を大量に使っています。

そのため、「普通のTypeScript抽象クラス」ではなく、Angularにこのクラスを認識させる必要があり、`@Directive()` が付いています。

そして、このクラスが凄いことになって見える最大の理由は、責務がものすごく多いことです。

```text
ExperimentCompareBase
│
├─ NgRx Store
│   ├─ select
│   └─ dispatch
│
├─ Router
│
├─ 実験データ比較
│   ├─ lodash get / has / isEqual
│   └─ 差分計算
│
├─ Tree構築
│   ├─ MatTreeFlattener
│   ├─ FlatTreeControl
│   └─ MatTreeFlatDataSource
│
├─ Virtual Scroll
│   └─ CdkVirtualScrollViewport
│
├─ 複数Treeのスクロール同期
│
├─ 検索
│   ├─ find
│   ├─ findNext
│   └─ findPrev
│
├─ Tree展開状態保持
│
├─ window resize監視
│
├─ 自動refresh
│
├─ URL同期
│
└─ Signed URL取得
```

要するに、これは単なる「比較画面Componentの共通処理」ではなく、

> **実験比較画面のUI制御エンジン**

くらいのクラスになっています。

特に面白いのがここです。

```ts
@ViewChildren('virtualScrollRef')
virtualScrollRef: QueryList<CdkVirtualScrollViewport>;
```

そして、

```ts
this.virtualScrollRef.forEach(k => {
  if (k.elementRef.nativeElement !== kk.elementRef.nativeElement) {
    k.elementRef.nativeElement.scrollTo({
      top: target.scrollTop,
      left: target.scrollLeft
    });
  }
});
```

複数の実験を横並び比較するときに、

```text
実験A              実験B              実験C

General            General            General
 ├─ name            ├─ name            ├─ name
 ├─ status          ├─ status          ├─ status
 └─ params          └─ params          └─ params
      ↓ scroll           ↓                  ↓
      ↓──────────────────↓──────────────────↓
             全列を同期してスクロール
```

みたいなことまでやっています。

さらに、

```ts
goToNextDiff()
exapndAndScrollToPath()
```

で、

```text
「次の差分」
    ↓
差分ノードを特定
    ↓
親Treeを自動展開
    ↓
Virtual Scroll上の位置を計算
    ↓
比較中の全Experimentを同時スクロール
```

までしています。

これは確かに、Angularを勉強し始めた段階で突然読むと「何なんだこれは」となります。

ただ、今まで覚えてきたものに分解すると、意外と知っている部品が増えています。

```text
inject()                 ← 知っている
NgRx Store               ← 学習済み
Observable / pipe        ← 学習済み
filter/map/take          ← RxJS
@ViewChildren            ← viewChild系
@HostListener            ← Directive系
Router                   ← 今学習中
Lifecycle                ← OnDestroy等
Component継承            ← extends
```

残りの大物は主に、

```text
Angular Material Tree
CDK Virtual Scroll
Treeの差分アルゴリズム
```

です。

なので、コード全体を一気に理解しようとしない方がいいです。

このクラスなら私はまず、

```text
① このクラスは何者？
   → 実験比較画面のabstract基底クラス

② 何を表示する？
   → JSON的な実験データをTree化して横並び比較

③ Angular部分
   → Directive / DI / ViewChildren / Lifecycle / NgRx

④ UI特殊処理
   → Tree / VirtualScroll / Scroll同期

⑤ 業務ロジック
   → 差分判定 / 検索 / 次差分移動
```

の5層に切ります。

特に今回の収穫は大きくて、`@Directive()` を「HTML属性に付けるもの」とだけ覚えると、このコードを見た瞬間に混乱します。

ここで、

> **`@Directive()` は、Angular機能を使う抽象基底クラスにも使われる**

まで押さえておけば、ClearMLを読むうえでかなり実務的な理解になります。
