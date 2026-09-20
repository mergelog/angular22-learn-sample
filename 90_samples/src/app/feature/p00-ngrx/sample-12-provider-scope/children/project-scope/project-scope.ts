import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ActivityEditor } from '../activity-editor/activity-editor';
import { ActivityFeed } from '../activity-feed/activity-feed';
import { WorkspaceActivityService } from '../../workspace-activity.service';

@Component({
  selector: 'app-sample-12-project-scope',
  imports: [ActivityEditor, ActivityFeed],
  templateUrl: './project-scope.html',
  styleUrl: './project-scope.scss',
  // [■観点:component providers] ProjectScope ごとに新しい Service instance を作り、子孫へ公開する。
  providers: [WorkspaceActivityService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectScope {
  readonly projectName = input.required<string>();
}
