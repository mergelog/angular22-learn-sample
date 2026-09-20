import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SsDashboardStore } from '../../store/ss-dashboard.store';
import { SsLotList } from '../../ui/ss-lot-list/ss-lot-list';

@Component({
  selector: 'app-ss-sub-board',
  imports: [RouterLink, SsLotList],
  templateUrl: './ss-sub-board.html',
  styleUrl: './ss-sub-board.scss',
})
export class SsSubBoard {
  protected readonly dashboardStore = inject(SsDashboardStore);
}
