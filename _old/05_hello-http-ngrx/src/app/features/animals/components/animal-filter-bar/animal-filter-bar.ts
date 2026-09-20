import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

/**
 * 一覧の上に置く操作バー。
 * 入力値は自身で保持せず、そのまま親へ流す。debounce するのは store の役目。
 */
@Component({
  selector: "app-animal-filter-bar",
  templateUrl: "./animal-filter-bar.html",
  styleUrl: "./animal-filter-bar.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalFilterBar {
  readonly disabled = input(false);

  readonly keywordChange = output<string>();
  readonly reload = output<void>();

  protected onKeywordInput(event: Event): void {
    this.keywordChange.emit((event.target as HTMLInputElement).value);
  }
}
