import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { P03CompoNavi } from '../layout/p03-compo-navi/p03-compo-navi';
import { SearchResult, SearchResults, SearchResultType } from './search-results/search-results';

@Component({
  selector: 'app-c08-ng-template-dynamic',
  imports: [P03CompoNavi, SearchResults],
  templateUrl: './c08-ng-template-dynamic.html',
  styleUrl: './c08-ng-template-dynamic.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class C08NgTemplateDynamic {
  readonly resultTypes: readonly (SearchResultType | 'all')[] = ['all', 'project', 'experiment', 'model'];
  readonly activeType = signal<SearchResultType | 'all'>('all');
  readonly allResults: readonly SearchResult[] = [
    { id: 'project-1', type: 'project', title: 'Computer vision', detail: '3 experiments' },
    { id: 'experiment-1', type: 'experiment', title: 'Image classifier #42', detail: 'Running' },
    { id: 'model-1', type: 'model', title: 'ResNet-50', detail: 'Accuracy 94.2%' },
  ];
  readonly results = computed(() => {
    const activeType = this.activeType();
    return activeType === 'all'
      ? this.allResults
      : this.allResults.filter((result) => result.type === activeType);
  });

  setActiveType(type: SearchResultType | 'all'): void {
    this.activeType.set(type);
  }
}
