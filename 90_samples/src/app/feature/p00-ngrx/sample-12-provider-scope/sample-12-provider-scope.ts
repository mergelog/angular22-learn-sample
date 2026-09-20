import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { ProjectScope } from './children/project-scope/project-scope';

@Component({
  selector: 'app-sample-12-provider-scope',
  imports: [P00NgrxNavi, ProjectScope],
  templateUrl: './sample-12-provider-scope.html',
  styleUrl: './sample-12-provider-scope.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample12ProviderScope {}
