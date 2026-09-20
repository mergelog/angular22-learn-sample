import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WorkspaceActivityService } from '../../workspace-activity.service';

@Component({
  selector: 'app-sample-12-activity-feed',
  templateUrl: './activity-feed.html',
  styleUrl: './activity-feed.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFeed {
  // [■観点:DI共有] Editor と同じ injector 階層なので、同じ履歴 Signal を読む。
  readonly activities = inject(WorkspaceActivityService).activities;
}
