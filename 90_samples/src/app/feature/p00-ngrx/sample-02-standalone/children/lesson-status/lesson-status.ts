import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-lesson-status',
  imports: [],
  templateUrl: './lesson-status.html',
  styleUrl: './lesson-status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonStatus {
  readonly label = input.required<string>();
}
