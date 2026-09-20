import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { ClickCounter } from './click-counter/click-counter';

@Component({
  selector: 'app-sample-14-export-as',
  imports: [P00NgrxNavi, ClickCounter, MatButtonModule, MatMenuModule],
  templateUrl: './sample-14-export-as.html',
  styleUrl: './sample-14-export-as.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample14ExportAs {
  readonly selectedAction = signal('未選択');
}
