import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChildren, input, TemplateRef } from '@angular/core';

import { C07Template, TemplateSlot } from '../template-marker';

export interface TableExperiment {
  readonly id: string;
  readonly name: string;
  readonly owner: string;
}

@Component({
  selector: 'app-c07-experiment-table',
  imports: [NgTemplateOutlet],
  templateUrl: './experiment-table.html',
  styleUrl: './experiment-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperimentTable {
  readonly items = input.required<readonly TableExperiment[]>();
  readonly templates = contentChildren(C07Template);
  readonly headerTemplate = computed(() => this.templateFor('header'));
  readonly bodyTemplate = computed(() => this.templateFor('body'));
  readonly emptyTemplate = computed(() => this.templateFor('empty'));

  private templateFor(slot: TemplateSlot): TemplateRef<unknown> | undefined {
    return this.templates().find((template) => template.slot() === slot)?.template;
  }
}
