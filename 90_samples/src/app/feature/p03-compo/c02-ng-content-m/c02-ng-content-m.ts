import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { P03CompoNavi } from '../layout/p03-compo-navi/p03-compo-navi';
import { ContentCard } from './content-card/content-card';

@Component({
  selector: 'app-c02-ng-content-m',
  imports: [P03CompoNavi, ContentCard],
  templateUrl: './c02-ng-content-m.html',
  styleUrl: './c02-ng-content-m.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class C02NgContentM {
  readonly showFooter = signal(true);
  readonly actionCount = signal(0);

  toggleFooter(): void {
    this.showFooter.update((showFooter) => !showFooter);
  }

  runExperiment(): void {
    this.actionCount.update((count) => count + 1);
  }
}
