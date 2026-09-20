import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { SplitAreaComponent, SplitComponent, SplitGutterInteractionEvent } from 'angular-split';

import {
  changeSplitPercent,
  loadDashboard,
} from '../../feature/cafe-status/state/cafe-status.actions';
import {
  selectDashboard,
  selectLoading,
  selectLoadError,
  selectSplitPercent,
} from '../../feature/cafe-status/state/cafe-status.selectors';
import { BaseCafeEntityPage } from '../shared/entity-page/base-cafe-entity-page';
import { CafeTablesGrid } from './dumb/cafe-tables-grid/cafe-tables-grid';

@Component({
  selector: 'app-cafe-tables',
  imports: [CafeTablesGrid, DatePipe, RouterLink, RouterOutlet, SplitComponent, SplitAreaComponent],
  templateUrl: './cafe-tables.html',
  styleUrl: './cafe-tables.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafeTables extends BaseCafeEntityPage implements OnInit {
  private readonly store = inject(Store);

  protected readonly dashboard = this.store.selectSignal(selectDashboard);
  protected readonly loading = this.store.selectSignal(selectLoading);
  protected readonly errorMessage = this.store.selectSignal(selectLoadError);
  protected readonly splitPercent = this.store.selectSignal(selectSplitPercent);

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    this.store.dispatch(loadDashboard());
  }

  protected changeSplitPercent({ sizes }: SplitGutterInteractionEvent): void {
    const [listPercent] = sizes;

    if (typeof listPercent !== 'number') {
      return;
    }

    this.store.dispatch(changeSplitPercent({ splitPercent: listPercent }));
  }
}
