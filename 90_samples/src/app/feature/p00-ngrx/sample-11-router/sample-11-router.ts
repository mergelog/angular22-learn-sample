import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';

@Component({
  selector: 'app-sample-11-router',
  imports: [P00NgrxNavi, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './sample-11-router.html',
  styleUrl: './sample-11-router.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample11Router {}
