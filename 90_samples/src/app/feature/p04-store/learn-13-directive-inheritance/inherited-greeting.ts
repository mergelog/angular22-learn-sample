import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NameBase } from './name-base';

@Component({
  selector: 'app-inherited-greeting',
  template: '<p>こんにちは、{{ name() }}さん</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InheritedGreeting extends NameBase {}
