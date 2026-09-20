import { Component, input } from '@angular/core';

import type { Lot } from '../../data-access/dashboard.model';

@Component({
  selector: 'app-lot-list',
  templateUrl: './lot-list.html',
  styleUrl: './lot-list.scss',
})
export class LotList {
  readonly items = input.required<readonly Lot[]>();
}
