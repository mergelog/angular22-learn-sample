import { ChangeDetectionStrategy, Component } from '@angular/core';

import { P03CompoNavi } from '../layout/p03-compo-navi/p03-compo-navi';
import { Task, TaskList } from './task-list/task-list';

@Component({
  selector: 'app-c06-ng-template-content-child',
  imports: [P03CompoNavi, TaskList],
  templateUrl: './c06-ng-template-content-child.html',
  styleUrl: './c06-ng-template-content-child.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class C06NgTemplateContentChild {
  readonly tasks: readonly Task[] = [
    { id: 'task-1', title: '学習データを確認する', assignee: 'Aki' },
    { id: 'task-2', title: '評価指標を比較する', assignee: 'Ren' },
    { id: 'task-3', title: '実験結果を共有する', assignee: 'Mio' },
  ];
}
