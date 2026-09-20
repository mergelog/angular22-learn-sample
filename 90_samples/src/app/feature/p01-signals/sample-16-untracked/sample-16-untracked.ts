import { ChangeDetectionStrategy, Component, effect, signal, untracked } from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';

@Component({
  selector: 'app-sample-16-untracked',
  imports: [P01SignalsNavi],
  templateUrl: './sample-16-untracked.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample16Untracked {
  readonly selectedId = signal(1);
  readonly auditVersion = signal(0);
  readonly effectRuns = signal(0);
  private readonly auditSelection = effect(() => {
    this.selectedId();
    // [■観点:untracked] この参照はeffectの依存関係に登録しない。監査番号だけではeffectを再実行しない。
    untracked(() => this.auditVersion());
    this.effectRuns.update((value) => value + 1);
  });
  nextSelection(): void {
    this.selectedId.update((id) => id + 1);
  }
  bumpAuditVersion(): void {
    this.auditVersion.update((version) => version + 1);
  }
}
