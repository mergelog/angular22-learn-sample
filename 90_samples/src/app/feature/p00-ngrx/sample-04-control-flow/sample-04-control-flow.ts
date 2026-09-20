import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { DeferredChild } from './children/deferred-child/deferred-child';
import { FlowChild } from './children/flow-child/flow-child';

interface Task {
  id: number;
  title: string;
}

@Component({
  selector: 'app-sample-04-control-flow',
  imports: [P00NgrxNavi, FlowChild, DeferredChild],
  templateUrl: './sample-04-control-flow.html',
  styleUrl: './sample-04-control-flow.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample04ControlFlow {
  // [■観点:@if] false の間は FlowChild のインスタンスも DOM も存在しない。
  readonly showDetail = signal(false);

  // [■観点:@for] 配列の各要素ごとに FlowChild を生成する。track は既存DOMの対応付けに使う。
  readonly tasks = signal<Task[]>([]);
  private nextTaskId = 1;

  // [■観点:viewChildren] @if / @for による子の生成・破棄に合わせて結果も変化する。
  readonly flowChildren = viewChildren(FlowChild);
  readonly flowChildCount = computed(() => this.flowChildren().length);

  // [■観点:@defer] 操作されるまで DeferredChild は生成されず、結果は undefined のまま。
  readonly deferredChild = viewChild(DeferredChild);

  readonly lifecycleLog = signal<string[]>([]);

  toggleDetail(): void {
    this.showDetail.update((isShown) => !isShown);
  }

  addTask(): void {
    const id = this.nextTaskId++;
    this.tasks.update((tasks) => [...tasks, { id, title: `タスク ${id}` }]);
  }

  removeLastTask(): void {
    this.tasks.update((tasks) => tasks.slice(0, -1));
  }

  recordLifecycle(message: string): void {
    this.lifecycleLog.update((logs) => [message, ...logs].slice(0, 8));
  }
}
