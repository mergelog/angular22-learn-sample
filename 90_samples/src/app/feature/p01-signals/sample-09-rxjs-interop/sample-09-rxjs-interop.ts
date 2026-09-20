import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';

@Component({
  selector: 'app-sample-09-rxjs-interop',
  imports: [P01SignalsNavi],
  templateUrl: './sample-09-rxjs-interop.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample09RxjsInterop {
  readonly query = signal('Angular');
  // [■観点:toObservable] SignalをObservableへ変換して、既存のRxJS演算子で扱えるようにする。
  readonly query$ = toObservable(this.query);
  // [■観点:toSignal] Observableの最新値をテンプレートから読めるSignalへ戻す。
  readonly upperCaseQuery = toSignal(this.query$.pipe(map((query) => query.toUpperCase())), {
    initialValue: 'ANGULAR',
  });
  readonly characterCount = computed(() => this.upperCaseQuery().length);
  setQuery(value: string): void {
    this.query.set(value);
  }
}
