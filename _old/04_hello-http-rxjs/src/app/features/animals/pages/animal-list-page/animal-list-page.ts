import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ErrorBanner } from "@shared/ui/error-banner/error-banner";
import { Spinner } from "@shared/ui/spinner/spinner";
import { AnimalFilterBar } from "../../components/animal-filter-bar/animal-filter-bar";
import { AnimalGrid } from "../../components/animal-grid/animal-grid";
import { AnimalsStore } from "../../store/animals.store";

/**
 * ルートに紐づく smart component。
 * store の Observable を toSignal でテンプレート向きに変換し、操作はすべて store に委譲する。
 */
@Component({
  selector: "app-animal-list-page",
  templateUrl: "./animal-list-page.html",
  styleUrl: "./animal-list-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimalFilterBar, AnimalGrid, ErrorBanner, Spinner],
})
export class AnimalListPage implements OnInit {
  private readonly store = inject(AnimalsStore);

  protected readonly animals = toSignal(this.store.animals$, { requireSync: true });
  protected readonly keyword = toSignal(this.store.keyword$, { requireSync: true });
  protected readonly isLoading = toSignal(this.store.isLoading$, { requireSync: true });
  protected readonly error = toSignal(this.store.error$, { requireSync: true });
  protected readonly summary = toSignal(this.store.summary$, { requireSync: true });

  ngOnInit(): void {
    this.store.load();
  }

  protected onKeywordChange(keyword: string): void {
    this.store.changeKeyword(keyword);
  }

  protected onReload(): void {
    this.store.load();
  }

  protected onVisibleCountChange(visibleCount: number): void {
    this.store.reportVisibleCount(visibleCount);
  }
}
