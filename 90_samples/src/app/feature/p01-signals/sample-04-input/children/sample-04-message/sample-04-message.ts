import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  selector: 'app-sample-04-message',
  template: '<p>子が受け取った値: <strong>{{ message() }}</strong></p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample04Message {
  readonly message = input.required<string>();
}
