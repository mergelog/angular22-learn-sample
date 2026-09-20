import { LocaleText } from "ag-grid-community";

/**
 * AG Grid の UI 文言（フィルタのラベルなど）の日本語訳。
 * 未定義のキーは AG Grid 既定の英語にフォールバックする。
 */
export const AG_GRID_LOCALE_JA: LocaleText = {
  // フィルタ共通
  filterOoo: "フィルタ…",
  applyFilter: "適用",
  clearFilter: "クリア",
  resetFilter: "リセット",
  cancelFilter: "キャンセル",
  andCondition: "かつ",
  orCondition: "または",
  blank: "空",
  notBlank: "空でない",

  // テキストフィルタ
  contains: "含む",
  notContains: "含まない",
  equals: "等しい",
  notEqual: "等しくない",
  startsWith: "前方一致",
  endsWith: "後方一致",

  // 数値フィルタ
  lessThan: "より小さい",
  lessThanOrEqual: "以下",
  greaterThan: "より大きい",
  greaterThanOrEqual: "以上",
  inRange: "範囲",
  inRangeStart: "から",
  inRangeEnd: "まで",

  // スクリーンリーダー向け（"種別 フィルタ入力" のように列名の後ろに連結される）
  ariaFilterInput: "フィルタ入力",
  ariaFilterColumn: "列を絞り込む",
  ariaFilterMenuOpen: "フィルタメニューを開く",
  ariaColumnFiltered: "絞り込み中の列",

  // 列メニュー / オーバーレイ
  columns: "列",
  pinColumn: "列を固定",
  autosizeThisColumn: "この列幅を自動調整",
  resetColumns: "列をリセット",
  noRowsToShow: "表示できるデータがありません",
  loadingOoo: "読み込み中…",
};
