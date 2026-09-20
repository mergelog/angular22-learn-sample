import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SsDashboardStore } from '../../store/ss-dashboard.store';
import { SsLotList } from '../../ui/ss-lot-list/ss-lot-list';

@Component({
  selector: 'app-ss-main-board',
  imports: [RouterLink, SsLotList],
  templateUrl: './ss-main-board.html',
  styleUrl: './ss-main-board.scss',
})
export class SsMainBoard {
  protected readonly dashboardStore = inject(SsDashboardStore);
}
