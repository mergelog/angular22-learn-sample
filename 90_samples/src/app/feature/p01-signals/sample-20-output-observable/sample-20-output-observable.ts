import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';

@Component({
  selector: 'app-sample-20-output-observable',
  imports: [P01SignalsNavi],
  templateUrl: './sample-20-output-observable.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample20OutputObservable {
  private readonly notices = new Subject<string>();
  // [■観点:outputFromObservable] Observableからのイベントをコンポーネントoutputへ変換する。
  readonly notice = outputFromObservable(this.notices);
  readonly manualNotice = output<string>();
  // [■観点:outputToObservable] outputをObservableとして既存のRxJS処理に渡せる。
  readonly manualNotice$ = outputToObservable(this.manualNotice);
  readonly received = signal('まだイベントはない');
  constructor() {
    this.manualNotice$.subscribe((value) => this.received.set(`Observableで受信: ${value}`));
  }
  emitFromObservable(): void {
    this.notices.next('Observableからoutputへ変換した通知');
  }
  emitManual(): void {
    this.manualNotice.emit('outputからObservableへ変換した通知');
  }
}
