import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CafeInfoHeader } from '../../dumb/cafe-info-header/cafe-info-header';
import { BaseCafeTableOutput } from './base-cafe-table-output';

@Component({
  selector: 'app-cafe-table-output',
  imports: [CafeInfoHeader],
  templateUrl: './cafe-table-output.html',
  styleUrl: './cafe-table-output.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafeTableOutput extends BaseCafeTableOutput {}
