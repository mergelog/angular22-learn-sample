Remote Control is active · Continue here, on your phone, or at claude.ai/code

/clear
dashboard.selectors.ts#6-6
const selectViewModel = createSelector(
  dashboardFeature.selectItems,
  dashboardFeature.selectLoading,
  dashboardFeature.selectError,
  (items, loading, error) => ({
    items,
    loading,
    error,
  }),
);

確認しました。結論から言うと createSelector は必須ではありません。ただし「複数の値を1つのオブジェクトにまとめる」場合だけは、メモ化のために事実上必要です。

1. dashboardFeature.selectItems はすでに selector
createFeature が生成する selectItems / selectLoading / selectError は型としても MemoizedSelector（内部で createFeatureSelector + createSelector 済み）です。なので createSelector で包み直す必要はまったくなく、そのまま渡せます。


readonly items$ = this.store.select(dashboardFeature.selectItems);
readonly loading$ = this.store.select(dashboardFeature.selectLoading);
実際 dashboard.selectors.ts の selectItems: dashboardFeature.selectItems は「再エクスポートしているだけ」で、これは正しい形です。

2. selectViewModel にだけ createSelector が要る理由
store.select(fn) の実体は map(fn) → distinctUntilChanged()（参照比較）です（node_modules/@ngrx/store/fesm2022/ngrx-store.mjs:634-650 で確認）。

なので、こう書くと壊れます:


// NG
readonly viewModel$ = this.store.select((s) => ({
  items: s.dashboard.items,
  loading: s.dashboard.loading,
  error: s.dashboard.error,
}));
毎回新しいオブジェクトリテラルを作る → 参照が毎回変わる → distinctUntilChanged が素通り → 無関係な feature の action を含め、dispatch のたびに再発行されます。

createSelector は、入力 selector の結果が参照的に変わらなければ projector を再実行せず前回の結果オブジェクトをそのまま返すので、identity が安定して distinctUntilChanged が効きます。つまり「まとめる」なら createSelector（かそれ相当のメモ化）は必要です。

3. 代替案
A. まとめない（signal で3本に分ける）— 今のおすすめ
NgRx 22 には store.selectSignal(selector, { equal? }) があります。


@Injectable()
export class DashboardService {
  private readonly store = inject(Store);

  readonly items = this.store.selectSignal(dashboardFeature.selectItems);
  readonly loading = this.store.selectSignal(dashboardFeature.selectLoading);
  readonly error = this.store.selectSignal(dashboardFeature.selectError);
}

@if (error()) { <p role="alert">{{ error() }}</p> }
@if (loading() && items().length === 0) { <p>Loading...</p> }
@else { <app-lot-list [items]="items()" /> }
selectViewModel も AsyncPipe も、main-board.html の @if (viewModel$ | async; as viewModel) という外側ラッパごと消えます。

補足として正確に: VM にまとめる本来の目的の一つは「3つが揃った1スナップショットで描画する」ことで、Observable 3本 + AsyncPipe 3個だとこれが崩れます（各々が別々に emit するため中間状態が一瞬描かれうる）。一方 signal は pull ベースで、変更検知1パス内で3つとも最新値を読むため、この問題は起きません。だから「分ける」なら signal であることが条件です。

B. facade 側で computed にまとめる

readonly viewModel = computed(() => ({
  items: this.items(),
  loading: this.loading(),
  error: this.error(),
}));
createSelector と同じ役割を Angular の signal グラフでやる形です。ただし store 層ではないので他 feature からは再利用できません。その VM が1画面専用ならこれで十分です。

C. createFeature の extraSelectors に書く
selectors.ts というファイル自体を無くしたいだけなら、これが使えます。


export const dashboardFeature = createFeature({
  name: 'dashboard',
  reducer: createReducer(/* ... */),
  extraSelectors: ({ selectItems, selectLoading, selectError }) => ({
    selectViewModel: createSelector(
      selectItems,
      selectLoading,
      selectError,
      (items, loading, error) => ({ items, loading, error }),
    ),
  }),
});
dashboardFeature.selectViewModel で参照できます。中身は結局 createSelector なので「書かずに済む」わけではありません。

D. combineLatest — 非推奨
手書きの createSelector 劣化版です。メモ化も distinctUntilChanged も自前で面倒を見ることになり、store 層で共有もできません。

4. 大規模案件での線引き
ケース	書き方
state をそのまま出すだけ	createSelector 不要。dashboardFeature.selectXxx をそのまま使う
派生・結合（フィルタ、ソート、join、VM 化）	createSelector。ここを省くとメモ化が消える
VM を複数コンポーネントで共有	store 層（selectors.ts または extraSelectors）
VM が1画面専用	facade の computed、あるいはそもそも VM を作らず signal 3本
今のコードは C 案（selectViewModel を1画面でしか使っていない）に該当するので、A 案の signal 3本に倒すのが一番シンプルになります。適用しますか？