import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { CafeTable } from '../../../../core/model/cafe-status.model';

@Component({
  selector: 'app-cafe-info-header',
  templateUrl: './cafe-info-header.html',
  styleUrl: './cafe-info-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafeInfoHeader {
  readonly table = input.required<CafeTable>();
  readonly closeRequested = output<void>();
}
