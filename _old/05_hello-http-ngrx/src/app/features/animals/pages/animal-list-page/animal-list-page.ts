import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ErrorBanner } from "@shared/ui/error-banner/error-banner";
import { Spinner } from "@shared/ui/spinner/spinner";
import { AnimalFilterBar } from "../../components/animal-filter-bar/animal-filter-bar";
import { AnimalGrid } from "../../components/animal-grid/animal-grid";
import { AnimalListPageActions } from "../../store/animals.actions";
import { AnimalsSelectors } from "../../store/animals.selectors";

/**
 * ルートに紐づく smart component。
 * 読み取りは selectSignal、書き込みは dispatch だけで、判断は一切持たない。
 */
@Component({
  selector: "app-animal-list-page",
  templateUrl: "./animal-list-page.html",
  styleUrl: "./animal-list-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimalFilterBar, AnimalGrid, ErrorBanner, Spinner],
})
export class AnimalListPage implements OnInit {
  private readonly store = inject(Store);

  protected readonly animals = this.store.selectSignal(AnimalsSelectors.selectAnimals);
  protected readonly keyword = this.store.selectSignal(AnimalsSelectors.selectKeyword);
  protected readonly isLoading = this.store.selectSignal(AnimalsSelectors.selectIsLoading);
  protected readonly error = this.store.selectSignal(AnimalsSelectors.selectError);
  protected readonly summary = this.store.selectSignal(AnimalsSelectors.selectSummary);

  ngOnInit(): void {
    this.store.dispatch(AnimalListPageActions.opened());
  }

  protected onKeywordChange(keyword: string): void {
    this.store.dispatch(AnimalListPageActions.keywordInputChanged({ keyword }));
  }

  protected onReload(): void {
    this.store.dispatch(AnimalListPageActions.reloadClicked());
  }

  protected onVisibleCountChange(visibleCount: number): void {
    this.store.dispatch(AnimalListPageActions.visibleRowCountChanged({ visibleCount }));
  }
}
