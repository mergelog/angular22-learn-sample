import { themeQuartz } from "ag-grid-community";

/**
 * アプリ全体で共有するグリッドの見た目。
 * 画面ごとに色を変えないよう、テーマの定義はここだけに置く。
 */
export const APP_GRID_THEME = themeQuartz.withParams({
  accentColor: "#2563eb",
  borderColor: "#e2e8f0",
  headerBackgroundColor: "#f8fafc",
  headerTextColor: "#0f172a",
  foregroundColor: "#0f172a",
  fontFamily: "Arial, sans-serif",
  fontSize: 13,
  headerFontWeight: 700,
});
