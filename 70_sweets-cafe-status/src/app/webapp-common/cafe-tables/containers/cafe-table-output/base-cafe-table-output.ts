import { computed, DestroyRef, Directive, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, map } from 'rxjs';

import { UpdateTableRequest } from '../../../../core/model/cafe-status.model';
import { updateTable } from '../../../../feature/cafe-status/state/cafe-status.actions';
import {
  selectDashboard,
  selectLoading,
  selectUpdateError,
  selectUpdatingTableNumber,
} from '../../../../feature/cafe-status/state/cafe-status.selectors';

@Directive()
export abstract class BaseCafeTableOutput {
  private readonly store = inject(Store);
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly dashboard = this.store.selectSignal(selectDashboard);
  protected readonly loading = this.store.selectSignal(selectLoading);
  protected readonly updatingTableNumber = this.store.selectSignal(selectUpdatingTableNumber);
  private readonly storedUpdateError = this.store.selectSignal(selectUpdateError);
  protected readonly generatedAt = computed(() => this.dashboard()?.generatedAt ?? null);
  protected readonly tableNumber = signal<string | null>(null);
  protected readonly selectedTable = computed(() => {
    const tableNumber = this.tableNumber();
    return this.dashboard()?.tables.find((table) => table.tableNumber === tableNumber) ?? null;
  });
  protected readonly updateError = computed(() => {
    const updateError = this.storedUpdateError();
    return updateError?.tableNumber === this.tableNumber() ? updateError.message : null;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('tableNumber')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((tableNumber) => this.tableNumber.set(tableNumber));
  }

  protected closePanel(): Promise<boolean> {
    return this.router.navigate(['..'], { relativeTo: this.route });
  }

  protected saveTable(request: UpdateTableRequest): void {
    this.store.dispatch(updateTable({ request }));
  }
}
