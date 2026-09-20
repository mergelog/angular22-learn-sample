/**
 * ngrx のアクション定義の書き方を 3 通り並べた比較用ファイル。
 *
 *   A: createActionGroup / スペース区切りのイベント名 -> ProcessingActions.userClickedToggleButton
 *   B: createAction                                  -> userClickedSecondToggleButton
 *   C: createActionGroup / 1 語のイベント名           -> ProcessingActions.toggle
 *
 * ============================================================
 * 実測した違い（tsserver / tsc で確認）
 * ============================================================
 *
 * 1) コードの追跡しやすさ
 *
 *                    | A             | B              | C
 *   -----------------+---------------+----------------+---------------
 *   Go to Definition | なし          | actions.ts へ  | なし
 *   Find References  | 2 件(定義なし) | 6 件(定義あり) | 2 件(定義なし)
 *   grep で定義に届く | ×             | ○              | △ -i が必要
 *
 *   createActionGroup は mapped type の `as` 句でキーを再マップするため
 *   (Toggle -> toggle)、元のキーと生成されたプロパティの対応をコンパイラが
 *   位置情報として保持しない。結果、定義 <-> 使用箇所のジャンプが双方向で切れる。
 *   定義側から Find References しても自分自身 1 件しか返らない
 *   （＝「このアクションはどこで使われている?」も答えられない）。
 *   イベント名の単語数は無関係で、createActionGroup を使う時点でこうなる。
 *   C の grep が △ なのは大文字小文字の差だけだから。-i を付ければ出るが、
 *   toggleProcessing / toggleLabel といったノイズも全部拾う。
 *
 * 2) 重複アクションの検出
 *
 *   createActionGroup は同じグループ内で名前が衝突するとコンパイルエラーになる。
 *     error TS2322: ... not assignable to type '"toggle action is already defined"'
 *   createAction は同じ type 文字列を 2 回書いてもエラーが一切出ない。
 *   type が丸かぶりのアクションが 2 つでき、両方の reducer が同時に反応する。
 *
 * ============================================================
 * 大規模案件ではどれを使うか → A/C の createActionGroup を推す
 * ============================================================
 *
 * 上のナビゲーションの弱点はそのままコストだが、規模が大きくなるほど
 * 別の要素のほうが効いてくる。
 *
 *   - source 文字列の重複記述。createAction 方式だと '[Processing] ...' を
 *     全アクションに手書きする。30 feature x 10 アクションで 300 個。
 *     リネーム漏れ・タイポ・コピペ由来の間違った prefix が必ず混入し、
 *     しかもどれもコンパイルが通ってしまう。createActionGroup なら source は 1 箇所。
 *
 *   - 調査の起点が identifier ではない。本番で不具合を追うときの入口は
 *     DevTools のログに出ている '[Processing] User Clicked Toggle Button' という
 *     文字列で、これで grep すれば定義に一発で届く。識別子で grep する場面は
 *     思ったより少ない。type 文字列で grep する癖をつければ実務上は吸収できる。
 *     重複アクションの事故のほうはそうはいかない。
 *
 *   - 置き場所が規約で決まる。feature/store/*.actions.ts という配置が守られていれば
 *     「どこにあるか」は検索する問題ではなくなる。
 *
 * B の createAction が向くのは、アクション数が十数個で収まる小規模、
 * 既存コードが全部その形で統一されている場合、あとは今回のような学習用途。
 *
 * ============================================================
 * ただし、この選択より効くことが他にある（大規模で効く順）
 * ============================================================
 *
 *   1. グループは feature 単位ではなく「イベントの発生源」単位で切る。
 *        export const ProcessingPageActions = createActionGroup({ source: 'Processing Page', ... });
 *        export const ProcessingApiActions  = createActionGroup({ source: 'Processing API',  ... });
 *      これが ngrx の言う Good Action Hygiene の核心。1 feature に複数グループができる。
 *
 *   2. アクションを使い回さない。複数の場所から同じアクションを dispatch し始めると、
 *      アクションが「イベント」から「命令」に変わり、実質グローバルなコマンドバスになる。
 *      大規模 ngrx が破綻する典型。発生源ごとに別アクションを定義し、
 *      reducer 側で同じ処理に合流させるのが正解。
 *      命名を Toggle（命令形）ではなく User Clicked Toggle Button（過去の出来事）に
 *      するのも同じ理由。
 *
 *   3. createFeature を使う。processing.selectors.ts のような、state のフィールド数だけ
 *      増える createSelector の定型文が消える。selector のボイラープレートは
 *      規模に比例して効いてくるので体感が大きい。
 *
 *   4. そもそも ngrx Store が要るか一度考える。Angular 22 世代なら @ngrx/signals の
 *      SignalStore という選択肢がある。今回のような「ローカルな boolean のトグル」は
 *      Store に載せる必要がない。feature 内で完結する状態は SignalStore、
 *      本当にアプリ横断で共有する状態だけ Store、という住み分けをしている
 *      大規模プロジェクトが増えている。全部 Store に載せると
 *      action/reducer/selector の三点セットが際限なく増える。
 */
import { createAction, createActionGroup, emptyProps } from '@ngrx/store';

export const ProcessingActions = createActionGroup({
  source: 'Processing',
  events: {
    // A: スペース区切り -> ProcessingActions.userClickedToggleButton
    //    type: '[Processing] User Clicked Toggle Button'
    'User Clicked Toggle Button': emptyProps(),

    
    // C: 1 語 -> ProcessingActions.toggle
    //    type: '[Processing] Toggle'
    Toggle: emptyProps(),
  },
});

// B: createAction — 識別子と type 文字列をそれぞれ自分で書く
//    唯一 Go to Definition / Find References / grep が定義まで届く書き方
export const userClickedSecondToggleButton = createAction(
  '[Processing] User Clicked Second Toggle Button',
);

console.dir([ProcessingActions, '<<A+C: ProcessingActions'], { depth: null });
console.dir([userClickedSecondToggleButton, '<<B: userClickedSecondToggleButton'], { depth: null });
