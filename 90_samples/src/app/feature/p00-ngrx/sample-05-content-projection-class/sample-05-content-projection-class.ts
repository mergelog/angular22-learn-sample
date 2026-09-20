import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { ProjectedPanelClass } from './projected-panel-class/projected-panel-class';

@Component({
  selector: 'app-sample-05-content-projection-class',
  imports: [P00NgrxNavi, ProjectedPanelClass],
  templateUrl: './sample-05-content-projection-class.html',
  styleUrl: './sample-05-content-projection-class.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample05ContentProjectionClass {}
