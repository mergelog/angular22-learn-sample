import { ChangeDetectionStrategy, Component } from '@angular/core';

import { P03CompoNavi } from '../layout/p03-compo-navi/p03-compo-navi';
import { Child } from './child/child';

@Component({
  selector: 'app-c01-ng-content',
  imports: [P03CompoNavi, Child],
  templateUrl: './c01-ng-content.html',
  styleUrl: './c01-ng-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class C01NgContent {}
