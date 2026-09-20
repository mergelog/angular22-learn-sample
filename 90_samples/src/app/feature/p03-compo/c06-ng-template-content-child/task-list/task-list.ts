import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, input, TemplateRef } from '@angular/core';

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly assignee: string;
}

export interface TaskTemplateContext {
  readonly $implicit: Task;
  readonly rowIndex: number;
}

@Component({
  selector: 'app-c06-task-list',
  imports: [NgTemplateOutlet],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskList {
  readonly items = input.required<readonly Task[]>();
  readonly rowTemplate = contentChild.required<TemplateRef<TaskTemplateContext>>(TemplateRef);
}
