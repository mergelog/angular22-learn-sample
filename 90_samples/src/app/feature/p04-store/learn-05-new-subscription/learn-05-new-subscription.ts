import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';

@Component({
  selector: 'app-learn-05-new-subscription',
  imports: [P04StoreNavi],
  templateUrl: './learn-05-new-subscription.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn05NewSubscription implements OnDestroy {
  private readonly subscriptions = new Subscription();

  readonly fastCount = signal(0);
  readonly slowCount = signal(0);
  readonly stopped = signal(false);

  constructor() {
    
    // interval(500)が返すのがObservable
    
    this.subscriptions.add(interval(500).subscribe((count) => this.fastCount.set(count + 1)));
    this.subscriptions.add(interval(1000).subscribe((count) => this.slowCount.set(count + 1)));
  }

  stop(): void {
    this.subscriptions.unsubscribe();
    this.stopped.set(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
