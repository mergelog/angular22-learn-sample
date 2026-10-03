import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';
import { InheritedGreeting } from './inherited-greeting';

@Component({
  selector: 'app-learn-13-directive-inheritance',
  imports: [P04StoreNavi, InheritedGreeting],
  templateUrl: './learn-13-directive-inheritance.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn13DirectiveInheritance {
  readonly name = signal('太郎');
}
