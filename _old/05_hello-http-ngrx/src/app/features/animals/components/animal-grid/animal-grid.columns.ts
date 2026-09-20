import { ColDef } from "ag-grid-community";
import { ANIMAL_KIND_LABELS } from "../../animal-kind.labels";
import { Animal } from "../../data-access/animal.model";

/**
 * 全列に効かせる既定値。
 * `floatingFilter` でヘッダ直下に入力欄を出し、列メニューを開かずに絞り込めるようにする。
 */
export const ANIMAL_GRID_DEFAULT_COL_DEF: ColDef<Animal> = {
  flex: 1,
  minWidth: 120,
  sortable: true,
  resizable: true,
  filter: true,
  floatingFilter: true,
};

/**
 * 列定義。画面が増えても再利用できるよう、component 本体とはファイルを分けている。
 *
 * `kind` は valueGetter でラベルへ変換している。表示が「犬」なのに
 * フィルタは "dog" でしか当たらない、という食い違いを避けるため。
 */
export const ANIMAL_COLUMN_DEFS: ColDef<Animal>[] = [
  {
    field: "accountId",
    headerName: "アカウント ID",
    filter: "agTextColumnFilter",
  },
  {
    field: "name",
    headerName: "名前",
    filter: "agTextColumnFilter",
  },
  {
    colId: "kind",
    headerName: "種別",
    filter: "agTextColumnFilter",
    maxWidth: 140,
    valueGetter: ({ data }) => (data ? ANIMAL_KIND_LABELS[data.kind] : ""),
  },
  {
    field: "age",
    headerName: "年齢",
    filter: "agNumberColumnFilter",
    maxWidth: 160,
    type: "numericColumn",
    valueFormatter: ({ value }) => (typeof value === "number" ? `${value} 歳` : ""),
  },
  {
    field: "weight",
    headerName: "体重",
    filter: "agNumberColumnFilter",
    maxWidth: 160,
    type: "numericColumn",
    valueFormatter: ({ value }) => (typeof value === "number" ? `${value.toFixed(1)} kg` : ""),
  },
];
