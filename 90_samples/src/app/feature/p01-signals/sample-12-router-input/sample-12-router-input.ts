import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';

@Component({
  selector: 'app-sample-12-router-input',
  imports: [RouterLink, P01SignalsNavi],
  templateUrl: './sample-12-router-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample12RouterInput {
  // [■観点:withComponentInputBinding] ルートパラメータとクエリパラメータをinput Signalとして直接受け取る。
  readonly lessonId = input('overview');
  readonly filter = input('all');
}
