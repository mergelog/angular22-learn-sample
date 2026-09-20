import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Grand } from './grand/grand';

@Component({
  selector: 'app-c01-child',
  imports: [Grand],
  templateUrl: './child.html',
  styleUrl: './child.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Child {}
