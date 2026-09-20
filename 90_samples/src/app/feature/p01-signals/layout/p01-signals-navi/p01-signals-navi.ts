import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-p01-signals-navi',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './p01-signals-navi.html',
  styleUrl: './p01-signals-navi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class P01SignalsNavi {
  readonly samples = [
    { path: 'canvas', label: 'canvas' },
    { path: 'computed', label: 'computed' },
    { path: 'novice', label: 'novice' },
    { path: 'sample-01-signal', label: '01 signal' },
    { path: 'sample-02-computed', label: '02 computed' },
    { path: 'sample-03-effect', label: '03 effect' },
    { path: 'sample-04-input', label: '04 input' },
    { path: 'sample-05-input-transform', label: '05 transform' },
    { path: 'sample-06-output', label: '06 output' },
    { path: 'sample-07-model', label: '07 model' },
    { path: 'sample-08-query', label: '08 queries' },
    { path: 'sample-09-rxjs-interop', label: '09 RxJS' },
    { path: 'sample-10-linked-signal', label: '10 linkedSignal' },
    { path: 'sample-11-resource', label: '11 resource' },
    { path: 'sample-12-router-input', label: '12 router input' },
    { path: 'sample-13-signal-store-state', label: '13 store state' },
    { path: 'sample-14-signal-store-methods', label: '14 store methods' },
    { path: 'sample-15-signal-store-hooks', label: '15 store hooks' },
    { path: 'sample-16-untracked', label: '16 untracked' },
    { path: 'sample-17-multiple-queries', label: '17 multiple queries' },
    { path: 'sample-18-readonly', label: '18 asReadonly' },
    { path: 'sample-19-effect-cleanup', label: '19 onCleanup' },
    { path: 'sample-20-output-observable', label: '20 output RxJS' },
    { path: 'sample-21-injection-context', label: '21 injection context' },
    { path: 'sample-22-ok-view-child', label: '22 viewChild OK' },
    { path: 'sample-22-ng-view-child', label: '22 viewChild NG' },
  ];
}
