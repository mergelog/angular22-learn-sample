import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { ProjectedPanel } from './projected-panel/projected-panel';

@Component({
  selector: 'app-sample-05-content-projection',
  imports: [P00NgrxNavi, ProjectedPanel],
  templateUrl: './sample-05-content-projection.html',
  styleUrl: './sample-05-content-projection.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample05ContentProjection {}
