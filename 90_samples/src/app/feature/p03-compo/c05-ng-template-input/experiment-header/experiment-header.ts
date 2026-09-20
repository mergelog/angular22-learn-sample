import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, TemplateRef } from '@angular/core';

export interface HeaderActionTemplateContext {
  readonly smallScreen: boolean;
}

@Component({
  selector: 'app-c05-experiment-header',
  imports: [NgTemplateOutlet],
  templateUrl: './experiment-header.html',
  styleUrl: './experiment-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperimentHeader {
  readonly actionTemplate = input.required<TemplateRef<HeaderActionTemplateContext>>();
  readonly smallScreen = input.required<boolean>();
}
