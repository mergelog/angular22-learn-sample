import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  selector: 'app-sample-17-tag',
  template: '<span>{{ label() }}</span>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample17Tag {
  readonly label = input.required<string>();
}
