import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { TemplateHost } from './template-host/template-host';

@Component({
  selector: 'app-sample-06-template-outlet-basic',
  imports: [P00NgrxNavi, TemplateHost],
  templateUrl: './sample-06-template-outlet-basic.html',
  styleUrl: './sample-06-template-outlet-basic.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample06TemplateOutletBasic {}
