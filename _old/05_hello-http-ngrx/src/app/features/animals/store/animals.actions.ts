import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { Animal } from "../data-access/animal.model";

/**
 * 画面で起きた出来事。
 * 「読み込め」という命令ではなく「開かれた」「押された」という事実で名前を付ける。
 * 命令で名付けると、後から同じ処理を別画面でも起こしたくなったときに action が増える。
 */
export const AnimalListPageActions = createActionGroup({
  source: "Animal List Page",
  events: {
    Opened: emptyProps(),
    "Reload Clicked": emptyProps(),
    /** キーストロークごとに飛ぶ生の入力値。debounce 前なので state には載せない。 */
    "Keyword Input Changed": props<{ keyword: string }>(),
    /** AG Grid のフィルタ適用後の行数。件数を知っているのはグリッドだけなので画面から返す。 */
    "Visible Row Count Changed": props<{ visibleCount: number }>(),
  },
});

/**
 * 入力が落ち着いた後の「確定したキーワード」。
 * dispatch するのは effect だけで、component からは呼ばない。
 */
export const AnimalsFilterActions = createActionGroup({
  source: "Animals Filter",
  events: {
    "Keyword Settled": props<{ keyword: string }>(),
  },
});

/** API の応答。成功と失敗を別 action にして、reducer 側で分岐を書かずに済ませる。 */
export const AnimalsApiActions = createActionGroup({
  source: "Animals API",
  events: {
    "Load Animals Succeeded": props<{ animals: Animal[] }>(),
    "Load Animals Failed": props<{ error: string }>(),
  },
});
