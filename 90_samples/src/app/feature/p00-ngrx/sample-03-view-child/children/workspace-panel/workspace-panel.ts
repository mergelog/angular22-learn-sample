import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'app-sample-03-workspace-panel',
  imports: [TaskCard],
  templateUrl: './workspace-panel.html',
  styleUrl: './workspace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspacePanel {
  readonly showExtraTask = signal(false);

  // #primaryTask が指す子コンポーネントを必須で取得する。
  readonly primaryTask = viewChild.required<TaskCard>('primaryTask');
  
  // [■観点:viewChildren]このビューにある TaskCard をすべて取得する。@if により内容は変化する。
  readonly taskCards = viewChildren(TaskCard);
  
  readonly taskCount = computed(() => this.taskCards().length);

  toggleExtraTask(): void {
    this.showExtraTask.update((isShown) => !isShown);
  }

  archiveAll(): void {
    this.taskCards().forEach((task) => task.archive());
  }

  restoreAll(): void {
    this.taskCards().forEach((task) => task.restore());
  }
}
