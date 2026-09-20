import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-sample-15-status-widget',
  template: `
    <article class="status-widget">
      <strong>状態 Widget</strong>
      <span>{{ message() }}</span>
    </article>
  `,
  styles: `
    .status-widget {
      display: grid;
      gap: 6px;
      padding: 14px;
      border-left: 4px solid #43a047;
      background: #f1f8e9;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusWidget {
  readonly message = input('正常に稼働中');
}
