import { DestroyRef, Directive, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';

@Directive()
export abstract class BaseCafeEntityPage {
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedTableNumber = signal<string | null>(null);

  protected constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith(null),
        map(() => this.route.snapshot.firstChild?.paramMap.get('tableNumber') ?? null),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((tableNumber) => this.selectedTableNumber.set(tableNumber));
  }

  protected openTable(tableNumber: string): Promise<boolean> {
    return this.router.navigate([tableNumber, 'overview'], { relativeTo: this.route });
  }
}
