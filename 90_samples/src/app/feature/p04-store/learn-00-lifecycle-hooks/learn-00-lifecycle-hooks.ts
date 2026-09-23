import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';
import { ProfileCardComponent } from './profile-card';

@Component({
  selector: 'app-learn-00-lifecycle-hooks',
  imports: [P04StoreNavi, ProfileCardComponent],
  templateUrl: './learn-00-lifecycle-hooks.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn00LifecycleHooks {}
