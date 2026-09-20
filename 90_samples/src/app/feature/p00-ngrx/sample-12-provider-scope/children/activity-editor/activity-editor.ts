import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WorkspaceActivityService } from '../../workspace-activity.service';

@Component({
  selector: 'app-sample-12-activity-editor',
  templateUrl: './activity-editor.html',
  styleUrl: './activity-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityEditor {
  // [■観点:inject] 最も近い祖先 ProjectScope が提供した instance を取得する。
  private readonly activity = inject(WorkspaceActivityService);

  addActivity(input: HTMLInputElement): void {
    const message = input.value.trim();
    if (!message) return;

    this.activity.add(message);
    input.value = '';
  }
}
