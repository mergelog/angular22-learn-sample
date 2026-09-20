import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { ModelUpdatedEvent } from "ag-grid-community";
import { AG_GRID_LOCALE_JA } from "@core/grid/ag-grid.locale";
import { APP_GRID_THEME } from "@core/grid/ag-grid.theme";
import { Animal } from "../../data-access/animal.model";
import { ANIMAL_COLUMN_DEFS, ANIMAL_GRID_DEFAULT_COL_DEF } from "./animal-grid.columns";

/**
 * AG Grid を包む presentational component。
 * store も HttpClient も知らず、入力された行を表示して結果の件数を返すだけ。
 */
@Component({
  selector: "app-animal-grid",
  templateUrl: "./animal-grid.html",
  styleUrl: "./animal-grid.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular],
})
export class AnimalGrid {
  readonly animals = input.required<Animal[]>();

  /** 列をまたいで横断検索するクイックフィルタ。空文字なら絞り込みなし。 */
  readonly quickFilterText = input("");

  /** 列フィルタとクイックフィルタを適用した後の行数。 */
  readonly visibleCountChange = output<number>();

  protected readonly theme = APP_GRID_THEME;
  protected readonly localeText = AG_GRID_LOCALE_JA;
  protected readonly columnDefs = ANIMAL_COLUMN_DEFS;
  protected readonly defaultColDef = ANIMAL_GRID_DEFAULT_COL_DEF;

  /**
   * 行データの差し替え・並び替え・フィルタのいずれでも発火する。
   * filterChanged だけを見ていると、再読み込み直後の件数が更新されない。
   */
  protected onModelUpdated(event: ModelUpdatedEvent<Animal>): void {
    this.visibleCountChange.emit(event.api.getDisplayedRowCount());
  }
}
