import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-sample-15-metric-widget',
  template: `
    <article class="metric-widget">
      <strong>指標 Widget</strong>
      <span>{{ message() }}</span>
    </article>
  `,
  styles: `
    .metric-widget {
      display: grid;
      gap: 6px;
      padding: 14px;
      border-left: 4px solid #1e88e5;
      background: #e3f2fd;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricWidget {
  readonly message = input('成功率 98%');
}
