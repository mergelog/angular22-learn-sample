import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Lesson } from '../../models/lesson';
import { LessonStatus } from '../lesson-status/lesson-status';

@Component({
  selector: 'app-lesson-card',
  imports: [LessonStatus, UpperCasePipe],
  templateUrl: './lesson-card.html',
  styleUrl: './lesson-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonCard {
  readonly lesson = input.required<Lesson>();
}
