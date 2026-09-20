import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { WorkItemPicker } from './children/work-item-picker';
import { WorkItemSummary } from './children/work-item-summary';

@Component({
  selector: 'app-sample-09-store-bridge',
  imports: [P00NgrxNavi, WorkItemPicker, WorkItemSummary],
  templateUrl: './sample-09-store-bridge.html',
  styleUrl: './sample-09-store-bridge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample09StoreBridge {}
