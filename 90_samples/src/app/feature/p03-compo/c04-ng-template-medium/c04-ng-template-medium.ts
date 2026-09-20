import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { P03CompoNavi } from '../layout/p03-compo-navi/p03-compo-navi';
import { Experiment, TemplateList } from './template-list/template-list';

@Component({
  selector: 'app-c04-ng-template-medium',
  imports: [P03CompoNavi, TemplateList],
  templateUrl: './c04-ng-template-medium.html',
  styleUrl: './c04-ng-template-medium.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class C04NgTemplateMedium {
  readonly viewMode = signal<'compact' | 'detail'>('compact');
  readonly experiments: readonly Experiment[] = [
    { id: 'exp-42', name: 'Image classifier', owner: 'Aki', status: 'Running' },
    { id: 'exp-43', name: 'Text summarizer', owner: 'Ren', status: 'Completed' },
    { id: 'exp-44', name: 'Anomaly detector', owner: 'Mio', status: 'Failed' },
  ];

  setViewMode(viewMode: 'compact' | 'detail'): void {
    this.viewMode.set(viewMode);
  }
}
