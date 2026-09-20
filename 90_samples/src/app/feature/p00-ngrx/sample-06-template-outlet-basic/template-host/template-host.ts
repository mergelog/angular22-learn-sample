import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-sample-06-template-host',
  imports: [NgTemplateOutlet],
  templateUrl: './template-host.html',
  styleUrl: './template-host.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateHost {
  // [■観点:TemplateRef] 親の ng-template が、まだ描画されていないテンプレートとして渡ってくる。
  readonly content = input.required<TemplateRef<unknown>>();
}
