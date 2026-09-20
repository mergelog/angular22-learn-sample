import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-sample-04-deferred-child',
  templateUrl: './deferred-child.html',
  styleUrl: './deferred-child.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeferredChild {
  readonly created = output<string>();

  ngOnInit(): void {
    this.created.emit('生成: @defer により遅延された子');
  }
}
