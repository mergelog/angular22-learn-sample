import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { P03CompoNavi } from '../layout/p03-compo-navi/p03-compo-navi';
import { ExperimentHeader } from './experiment-header/experiment-header';

@Component({
  selector: 'app-c05-ng-template-input',
  imports: [ExperimentHeader, P03CompoNavi],
  templateUrl: './c05-ng-template-input.html',
  styleUrl: './c05-ng-template-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class C05NgTemplateInput {
  readonly smallScreen = signal(false);
  readonly createdCount = signal(0);

  toggleScreenSize(): void {
    this.smallScreen.update((smallScreen) => !smallScreen);
  }

  createExperiment(): void {
    this.createdCount.update((count) => count + 1);
  }
}
