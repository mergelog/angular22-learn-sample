import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { CafeTable } from '../../../../core/model/cafe-status.model';

@Component({
  selector: 'app-cafe-info-header',
  imports: [DatePipe],
  templateUrl: './cafe-info-header.html',
  styleUrl: './cafe-info-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafeInfoHeader {
  readonly table = input.required<CafeTable>();
  readonly generatedAt = input<string | null>(null);
  readonly closeRequested = output<void>();
}
