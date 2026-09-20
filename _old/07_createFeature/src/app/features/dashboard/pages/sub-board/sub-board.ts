import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardService } from '../../data-access/dashboard.service';
import { LotList } from '../../ui/lot-list/lot-list';

@Component({
  selector: 'app-sub-board',
  imports: [AsyncPipe, RouterLink, LotList],
  templateUrl: './sub-board.html',
  styleUrl: './sub-board.scss',
})
export class SubBoard {
  private readonly dashboardService = inject(DashboardService);

  protected readonly viewModel$ = this.dashboardService.viewModel$;
}
