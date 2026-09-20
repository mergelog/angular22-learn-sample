import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { ColorActions } from './color.actions';

// ダメな例: state に表示文言をそのまま持たせる
//   - 「同期中か」を知りたい側が syncStatus === 'Effect が色を同期中…' と文字列比較する羽目になる
//   - 文言を変えた瞬間にその判定が壊れる。多言語対応も入れられない
//   - reducer（ドメイン層）が UI の都合を知ってしまう
//
// export interface ColorState {
//   backgroundColor: string;
//   syncStatus: string;
// }
//
// const initialState: ColorState = {
//   backgroundColor: '#64748b',
//   syncStatus: '待機中',
// };

// 良い例: 表示文言ではなく、意味を持つ union を state に置く
//   - 「同期中か」の判定が文言に依存しないので、文言を変えても壊れない
//   - 状態が増えたとき、網羅漏れを型が検出してくれる
//     （COLOR_SYNC_STATUS_LABELS の Record<ColorSyncStatus, string> がコンパイルエラーになる）
//   - 表示文言は color-sync-status.labels.ts へ追い出し、reducer は UI を知らない
/**
 * 同期処理の状態。
 * 表示文言ではなく「意味」を持たせることで、判定を selector 側に閉じ込められる。
 */
export type ColorSyncStatus = 'idle' | 'syncing' | 'succeeded';

export interface ColorState {
  backgroundColor: string;
  syncStatus: ColorSyncStatus;
}

const initialState: ColorState = {
  backgroundColor: '#64748b',
  syncStatus: 'idle',
};

export const colorFeature = createFeature({
  name: 'color',
  reducer: createReducer(
    initialState,

    // ダメな例
    // on(ColorActions.syncStarted, (state) => ({
    //   ...state,
    //   syncStatus: 'Effect が色を同期中…',
    // })),
    // 良い例
    on(ColorActions.syncStarted, (state) => ({
      ...state,
      syncStatus: 'syncing',
    })),

    // ダメな例
    // on(ColorActions.syncSucceeded, (state, { color }) => ({
    //   ...state,
    //   backgroundColor: color,
    //   syncStatus: 'Effect による色の同期が完了しました',
    // })),
    // 良い例
    on(ColorActions.syncSucceeded, (state, { color }) => ({
      ...state,
      backgroundColor: color,
      syncStatus: 'succeeded',
    })),
  ),

  // 自動生成された selectSyncStatus を受け取り、任意の名前で派生 selector を定義する。
  // union にしたおかげで、こういう判定を利用側にばらまかずに済む。
  //
  // ファイル下部で createSelector(colorFeature.selectSyncStatus, ...) と書いても同じ物は作れるが、
  // extraSelectors を選ぶ理由は3つ。
  //   1. base selector が引数で渡ってくるので、colorFeature を自己参照せずに済む
  //      （下部に書く場合は「定義途中の colorFeature」を参照する形になり、依存が閉じない）
  //   2. colorFeature に生えるので、colorFeature. の補完で自動生成分と派生分が一覧で見える
  //   3. base selector と同名にすると上書きできる（型が Omit<Feature, keyof ExtraSelectors> & ExtraSelectors）
  //      生の値を隠して派生版だけ公開したいときに使える
  extraSelectors: ({ selectSyncStatus }) => ({
    selectIsSyncing: createSelector(selectSyncStatus, (status) => status === 'syncing'),
  }),
});

// extraSelectors を使わない書き方。動作は全く同じで、置き場所だけが違う。
//   - createFeature を作り終えた後、外から colorFeature を参照して足す
//   - colorFeature. の補完に selectIsSyncing が出てこない
//   - ColorSelectors の中で 1 行だけ参照元が変わり、見た目が揃わない
//
// export const selectIsSyncing = createSelector(
//   colorFeature.selectSyncStatus,
//   (status) => status === 'syncing',
// );
//
// export const ColorSelectors = {
//   selectBackgroundColor: colorFeature.selectBackgroundColor,
//   selectSyncStatus: colorFeature.selectSyncStatus,
//   selectIsSyncing, // ← ここだけ colorFeature. ではない
// };

export const ColorSelectors = {
  selectBackgroundColor: colorFeature.selectBackgroundColor,
  selectSyncStatus: colorFeature.selectSyncStatus,
  // extraSelectors で足したもの。自動生成のルール（select + プロパティ名）には縛られない
  selectIsSyncing: colorFeature.selectIsSyncing,
};
