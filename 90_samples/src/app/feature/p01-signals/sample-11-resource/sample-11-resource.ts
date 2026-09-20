import { ChangeDetectionStrategy, Component, resource, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { delay, of } from 'rxjs';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';

@Component({
  selector: 'app-sample-11-resource',
  imports: [P01SignalsNavi],
  templateUrl: './sample-11-resource.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample11Resource {
  readonly userId = signal(1);
  // [■観点:resource] Promiseの結果・loading・errorを1つのResourceとして公開する。
  readonly promiseUser = resource({
    params: () => this.userId(),
    loader: async ({ params }) => ({ id: params, name: `User ${params}` }),
  });
  // [■観点:rxResource] Observableを返す既存のデータ取得処理にも同じ状態モデルを適用できる。
  readonly observableUser = rxResource({
    params: () => this.userId(),
    stream: ({ params }) => of({ id: params, name: `Rx User ${params}` }).pipe(delay(200)),
  });
  nextUser(): void {
    this.userId.update((id) => id + 1);
  }
}
