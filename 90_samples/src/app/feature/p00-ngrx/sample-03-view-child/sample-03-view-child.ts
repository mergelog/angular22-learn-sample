import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { WorkspacePanel } from './children/workspace-panel/workspace-panel';
import { Newc } from './children/newc/newc';

@Component({
  selector: 'app-sample-03-view-child',
  imports: [P00NgrxNavi, WorkspacePanel, Newc],
  templateUrl: './sample-03-view-child.html',
  styleUrl: './sample-03-view-child.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample03ViewChild {

  readonly newc = viewChild.required(Newc)
  newccc() {
    this.newc().changeA()
  }

  // [■観点:viewChild] 簡単にいうと、子を直接操作するため子のインスタンスを取得しているだけです。
  // 常に表示される WorkspacePanel を必須の子として取得する。
  readonly workspace // Signal<WorkspacePanel>
    = viewChild.required(WorkspacePanel);

  readonly lastAction = signal('まだ操作していません');

  archivePrimaryThroughChain(): void {
    // 親 → 子 → 孫。99段連鎖ではなく、このような複数段の参照があり得るという例。
    this.workspace().primaryTask().archive();
    this.lastAction.set('親 → WorkspacePanel → 最初のタスク をアーカイブしました');
  }

  archiveAll(): void {
    this.workspace().archiveAll();
    this.lastAction.set('親 → WorkspacePanel の archiveAll() を呼びました');
  
    this.newccc()
  }
}
