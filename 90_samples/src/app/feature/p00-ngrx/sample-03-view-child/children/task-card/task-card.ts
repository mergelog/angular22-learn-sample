import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-sample-03-task-card',
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCard {
  readonly title = input.required<string>();
  readonly isArchived = signal(false);

  archive(): void {
    this.isArchived.set(true);
  }

  restore(): void {
    this.isArchived.set(false);
  }
}
