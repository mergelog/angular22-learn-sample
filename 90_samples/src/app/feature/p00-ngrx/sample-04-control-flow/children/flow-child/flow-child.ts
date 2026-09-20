import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-sample-04-flow-child',
  templateUrl: './flow-child.html',
  styleUrl: './flow-child.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowChild {
  readonly label = input.required<string>();
  readonly created = output<string>();
  readonly destroyed = output<string>();

  ngOnInit(): void {
    this.created.emit(`生成: ${this.label()}`);
  }

  ngOnDestroy(): void {
    this.destroyed.emit(`破棄: ${this.label()}`);
  }
}
