import {
  ChangeDetectionStrategy,
  Component,
  effect,
  EffectRef,
  EnvironmentInjector,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { P01SignalsNavi } from '../layout/p01-signals-navi/p01-signals-navi';
@Component({
  selector: 'app-sample-21-injection-context',
  imports: [P01SignalsNavi],
  templateUrl: './sample-21-injection-context.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample21InjectionContext {
  private readonly injector = inject(EnvironmentInjector);
  readonly value = signal(0);
  readonly status = signal('まだ動的effectは作成していない');
  private effectRef?: EffectRef;
  createEffect(): void {
    if (this.effectRef) return;
    // [■観点:runInInjectionContext] コンストラクタ外でもDIコンテキストを用意し、effectなどDIが必要なAPIを生成する。
    this.effectRef = runInInjectionContext(this.injector, () =>
      effect(() => this.status.set(`動的effectが値 ${this.value()} を監視中`)),
    );
  }
  increment(): void {
    this.value.update((value) => value + 1);
  }
  destroyEffect(): void {
    this.effectRef?.destroy();
    this.effectRef = undefined;
    this.status.set('動的effectを破棄した');
  }
}
