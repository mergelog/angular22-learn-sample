import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  selector: 'app-sample-05-name',
  template: '<p>変換後: <strong>{{ name() }}</strong></p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample05Name {
  readonly name = input('', { transform: (value: string) => value.trim().toUpperCase() });
}
