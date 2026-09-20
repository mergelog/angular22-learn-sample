import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';

@Component({
  selector: 'app-inner-a',
  imports: [],
  styleUrl: './inner-a.scss',
  templateUrl: './inner-a.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InnerA {
  readonly message = input.required<string>();
  readonly messageSent = output<string>();
  readonly count = model(0);

  sendMessage(): void {
    this.messageSent.emit('子から親への通知です');
  }

  increment(): void {
    this.count.update((count) => count + 1);
  }
}
