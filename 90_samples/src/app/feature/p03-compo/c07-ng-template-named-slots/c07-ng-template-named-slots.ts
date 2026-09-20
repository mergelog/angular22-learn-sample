import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { P03CompoNavi } from '../layout/p03-compo-navi/p03-compo-navi';
import { ExperimentTable, TableExperiment } from './experiment-table/experiment-table';
import { C07Template } from './template-marker';

@Component({
  selector: 'app-c07-ng-template-named-slots',
  imports: [C07Template, ExperimentTable, P03CompoNavi],
  templateUrl: './c07-ng-template-named-slots.html',
  styleUrl: './c07-ng-template-named-slots.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class C07NgTemplateNamedSlots {
  readonly showItems = signal(true);
  readonly allItems: readonly TableExperiment[] = [
    { id: 'exp-21', name: 'Image classifier', owner: 'Aki' },
    { id: 'exp-22', name: 'Text summarizer', owner: 'Ren' },
  ];
  readonly items = computed(() => (this.showItems() ? this.allItems : []));

  toggleItems(): void {
    this.showItems.update((showItems) => !showItems);
  }
}
