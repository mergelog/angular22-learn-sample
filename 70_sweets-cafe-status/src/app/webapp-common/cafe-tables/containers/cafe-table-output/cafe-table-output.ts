import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseCafeTableOutput } from './base-cafe-table-output';

@Component({
  selector: 'app-cafe-table-output',
  templateUrl: './cafe-table-output.html',
  styleUrl: './cafe-table-output.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafeTableOutput extends BaseCafeTableOutput {}
