import { RequestStatus } from "@shared/models/request-status";
import { Animal } from "../data-access/animal.model";

export interface AnimalsState {
  /** API から取得した全件。AG Grid の rowData の元になる。 */
  animals: Animal[];
  status: RequestStatus;
  error: string | null;
  /** クイックフィルタの文字列。入力そのままではなく debounce 後の値が入る。 */
  keyword: string;
  /** AG Grid 側のフィルタ適用後に実際に表示されている行数。 */
  visibleCount: number;
}

export const INITIAL_ANIMALS_STATE: AnimalsState = {
  animals: [],
  status: "idle",
  error: null,
  keyword: "",
  visibleCount: 0,
};
