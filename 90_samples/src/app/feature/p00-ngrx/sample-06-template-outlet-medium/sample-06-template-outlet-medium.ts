import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { Chart } from './chart/chart';
import { Panel } from './panel/panel';

@Component({
  selector: 'app-sample-06-template-outlet-medium',
  imports: [NgTemplateOutlet, P00NgrxNavi, Chart, Panel],
  templateUrl: './sample-06-template-outlet-medium.html',
  styleUrl: './sample-06-template-outlet-medium.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample06TemplateOutletMedium {}
