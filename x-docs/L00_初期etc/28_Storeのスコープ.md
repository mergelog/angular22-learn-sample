Angularの状態管理の技術選定としては、こういう意味です。

「兄弟コンポーネント2つ程度だけで状態を共有したいなら、NgRx Storeなどのグローバルな状態管理に載せず、共通の親コンポーネントに状態を持ち上げる（lift state up）」

例えば、

```text
SearchPageComponent  ← 共通親。stateを持つ
├── FilterComponent
└── ResultTableComponent
```

Filterで条件を変更した結果をResultTableにも反映したい場合、

```ts
// 親
export class SearchPageComponent {
  readonly filter = signal<Filter>({ ... });
  readonly results = computed(() => ...);
}
```

```html
<!-- 親 -->
<app-filter
  [filter]="filter()"
  (filterChange)="filter.set($event)"
/>

<app-result-table
  [results]="results()"
/>
```

という設計です。

つまり表の行を日本語に展開すると、

> 「Filter と ResultTable のような少数の兄弟だけが同じstateを使うなら、共通親がstateを所有する。わざわざNgRx Storeなどへ昇格させない。」

という意味です。

なお「兄弟2つ程度」は厳密な数字ではありません。重要なのは、**その状態の利用範囲が1つの親配下に閉じているか**です。3兄弟でも親配下だけならliftで十分なことがあります。逆に2コンポーネントでも、画面をまたいで共有するならStore候補になります。
