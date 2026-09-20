import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, TemplateRef } from '@angular/core';
import { ReportRow, ReportRowTemplateContext } from '../models/report-row';

@Component({
  selector: 'app-sample-06-report-table',
  imports: [NgTemplateOutlet],
  templateUrl: './report-table.html',
  styleUrl: './report-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportTable {
  readonly rows = input.required<readonly ReportRow[]>();

  // [■観点:TemplateRef] ng-template を TypeScript で扱うときの型。描画内容そのものを受け取る。
  readonly rowTemplate = input.required<TemplateRef<ReportRowTemplateContext>>();
}
