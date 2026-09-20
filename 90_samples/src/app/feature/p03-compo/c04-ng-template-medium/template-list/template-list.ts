import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, TemplateRef } from '@angular/core';

export interface Experiment {
  readonly id: string;
  readonly name: string;
  readonly owner: string;
  readonly status: 'Running' | 'Completed' | 'Failed';
}

export interface ExperimentTemplateContext {
  readonly $implicit: Experiment;
  readonly rowIndex: number;
}

@Component({
  selector: 'app-p04-template-list',
  imports: [NgTemplateOutlet],
  templateUrl: './template-list.html',
  styleUrl: './template-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateList {
  readonly items = input.required<readonly Experiment[]>();
  readonly itemTemplate = input.required<TemplateRef<ExperimentTemplateContext>>();
}
