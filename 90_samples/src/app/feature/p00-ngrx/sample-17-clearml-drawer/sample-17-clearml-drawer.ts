import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { DrawerComponent } from './drawer/drawer.component';

@Component({
  selector: 'app-sample-17-clearml-drawer',
  imports: [DrawerComponent, P00NgrxNavi],
  templateUrl: './sample-17-clearml-drawer.html',
  styleUrl: './sample-17-clearml-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample17ClearmlDrawer {}
