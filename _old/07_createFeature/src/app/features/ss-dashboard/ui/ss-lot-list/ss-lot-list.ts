import { Component, input } from '@angular/core';

import type { SsLot } from '../../data-access/ss-dashboard.model';

@Component({
  selector: 'app-ss-lot-list',
  templateUrl: './ss-lot-list.html',
  styleUrl: './ss-lot-list.scss',
})
export class SsLotList {
  readonly items = input.required<readonly SsLot[]>();
}
