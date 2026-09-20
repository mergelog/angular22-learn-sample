調査結果を見る限り、20種類を均等に勉強する必要はありません。ClearML Web のコードリーディングを目的にするなら、学習順序はかなり絞れます。`input()` / `output()` が圧倒的に多く、次にテンプレート投影・テンプレート受け渡し・子参照、その先に DI・ルーティング・ダイアログ・特殊な動的描画があります。

今の理解状況も踏まえると、私は次の順番を勧めます。

| 段階 | 学ぶもの                                                 | 優先度 | 理由                                   |
| -- | ---------------------------------------------------- | --: | ------------------------------------ |
| 1  | `input()` / `output()` / `model()`                   | 最優先 | 親子通信の基礎。ClearMLでも圧倒的多数               |
| 2  | `<ng-content>` / `select`                            | 最優先 | 「親が子の中身を決める」という次の基本                  |
| 3  | `<ng-template>` / `TemplateRef` / `ngTemplateOutlet` | 最優先 | ClearMLの複雑なUIを読むための最大の関門             |
| 4  | テンプレート参照変数 `#xxx` / `viewChild()`                    |   高 | 子を直接触るコードがかなり多い                      |
| 5  | `contentChild()` / `contentChildren()`               |   高 | ng-content・TemplateRefを理解した後なら一気に分かる |
| 6  | `pTemplate` / 名前付きテンプレート                             |   高 | ClearMLのtableを読むなら重要                 |
| 7  | component `providers` / DI                           | 中〜高 | 親子ではなく「子孫に共有する」という別系統                |
| 8  | Router / Dialog                                      | 中〜高 | 画面レベルの親子・疑似的な入出力として頻出                |
| 9  | `ControlValueAccessor`                               |   中 | カスタムinputを触る場合に必要                    |
| 10 | 継承・Portal・動的生成など                                     | 後回し | 必要な箇所に遭遇してからで十分                      |

特に、今すぐ次に進むなら、

**`ng-template → TemplateRef → ngTemplateOutlet → contentChild/contentChildren`**

を一つのセットとして勉強するのが最も効率がいいと思います。

これは全部同じ話の延長だからです。

たとえば、

```html
<ng-template #row let-item>
  {{ item.name }}
</ng-template>
```

で「再利用可能なHTMLの設計図」を作る。

それを、

```ts
row = viewChild.required<TemplateRef<any>>('row');
```

のように TypeScript 側から取得することもできる。

あるいは親から子へ、

```html
<app-table [rowTemplate]="row" />
```

として渡す。

子では、

```html
<ng-container
  *ngTemplateOutlet="rowTemplate(); context: { $implicit: item }"
/>
```

として、データを差し込んで描画する。

さらに、

```html
<app-table>
  <ng-template pTemplate="body" let-row>
    ...
  </ng-template>
</app-table>
```

のようになると、ClearML の `table.component.ts` にかなり近づきます。

つまり、

**HTMLを渡す**
→ **HTMLを取得する**
→ **HTMLにデータを渡して描画する**
→ **複数のHTMLを名前別に仕分ける**

という一本の流れです。

ここが理解できると、今回の調査で出てきた

`ng-content`
→ `TemplateRef`
→ `ngTemplateOutlet`
→ `ContentChild`
→ `contentChildren(PrimeTemplate)`
→ `pTemplate`

がバラバラの機能ではなく、同じ「コンポーネントの外から表示内容を注入する仕組み」の発展形として見えるようになります。ClearML の table 周辺では特に重要です。

一方、`viewChild()` は少し別です。

こちらは、

```text
親
 ↓
子コンポーネントを取得
 ↓
子のメソッド・Signal・DOMなどを直接触る
```

という考え方です。

したがって頭の中では、

```text
input
    値を渡す

output
    イベントを返す

ng-content
    HTMLを渡す

TemplateRef
    HTMLの設計図を渡す

viewChild
    子そのものを取得する

contentChild
    親から渡されたHTMLやコンポーネントを子が取得する
```

くらいに分類しておけば十分です。

ここまで終わったら、ClearML 独特の複雑な部分へ進むのがよいです。

特に調査結果にある

`shared/ui-components/data/table/table.component.ts`

は、いきなり読む教材としてはかなり悪いです。`input/output/model/contentChildren/PrimeTemplate/TemplateRef` などが一つのコンポーネントに集まっているからです。

逆に、最初の教材として向いているのは今回追加された

`features/data-catalog/`

や

`features/quality-pipeline/`

です。

調査結果によれば、ここではほぼ

```text
Container
  ↓ input
Dumb Component
  ↓ output
Container
  ↓ dispatch
NgRx Store
```

という素直な構造になっています。

この構造を完全に読めるようにしてから、

```text
普通の input/output
        ↓
ng-content
        ↓
TemplateRef
        ↓
contentChild
        ↓
PrimeNG pTemplate
        ↓
ClearML Table
```

と進む方が理解しやすいです。

そして今回の20種類のうち、当面ほぼ放置してよいものもあります。

`exportAs`、同一要素のディレクティブ注入、`createComponent`、CDK Portal、`NgComponentOutlet`、ビルド時の `fileReplacements` は、「存在を知っている」程度で十分です。遭遇したときに調べれば足ります。

一方、継承だけは少し特殊です。ClearML Web では `features/` が `webapp-common/` を拡張する仕組みに使われているため、一般的なAngular学習では後回しでも、ClearMLを読むうえでは無視できません。ただし、これは親子関係を理解するための知識ではなく、

```text
Angularコンポーネントの親子
```

と

```text
TypeScriptクラスの継承
```

を明確に別物として理解できれば、まず十分です。

最終的には、頭の中に次の5系統だけ作ればよいと思います。

```text
① 値・イベント
input / output / model

② HTML・Template
ng-content
TemplateRef
ngTemplateOutlet
contentChild
pTemplate

③ コンポーネントそのものを触る
#templateRef
viewChild
exportAs

④ 階層を利用した共有
providers
DI
ControlValueAccessor

⑤ 親子を飛び越える
Router
Dialog
NgRx Store
Portal
```

この分類ができれば、今回検出された20種類を丸暗記する必要はなくなります。

今の段階なら、**次の学習テーマは `ng-template / TemplateRef / ngTemplateOutlet` が最優先**です。その次に `viewChild` と `contentChild` の違いを固め、そこまで終わった時点で実際の `experiments-table → table.component.ts` を一緒に追う、という順序が一番実務につながると思います。
