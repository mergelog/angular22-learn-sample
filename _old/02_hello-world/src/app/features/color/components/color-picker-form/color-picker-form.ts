import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { DEFAULT_BACKGROUND_COLOR } from '../../color.constants';
import { ColorPickerFormActions } from '../../store/color.actions';
import { ColorSelectors } from '../../store/color.reducer';

/** カラーピッカーをドラッグ中の連続入力を、どれくらい落ち着かせてから dispatch するか */
const PICK_DEBOUNCE_MS = 200;

@Component({
  selector: 'app-color-picker-form',
  templateUrl: './color-picker-form.html',
  styleUrl: './color-picker-form.css',
  imports: [AsyncPipe],
})
export class ColorPickerForm {
  private readonly store = inject(Store);

  /** 入力欄の見た目を即座に追従させるためのローカル状態。store にはまだ入れない */
  readonly pickedColor = signal(DEFAULT_BACKGROUND_COLOR);

  // $ が付く場面 (3-a): Signals に移行しきっていないコンポーネントの読み取り
  //
  // store.select() は Observable を返すので、テンプレートでは async パイプで購読する。
  // app.ts では同じ値を store.selectSignal() で取っており、そちらには $ が付かない。
  // 新規に書くなら selectSignal 側を使う。ここは比較のために残している。
  readonly backgroundColor$ = this.store.select(ColorSelectors.selectBackgroundColor);

  constructor() {
    // $ が付く場面 (3-b): toObservable() で意図的に Observable 側へ戻す
    //
    // <input type="color"> はドラッグ中に大量の input イベントを吐く。
    // これをそのまま dispatch すると、1 回の操作で何十ものアクションが store に流れる。
    // 間引きたいが、Signal には debounceTime に相当する時間軸の演算子が無い。
    // そこで toObservable() で Observable に戻し、RxJS 側で時間を扱う。
    const pickedColor$ = toObservable(this.pickedColor);

    pickedColor$
      .pipe(
        // toObservable() は購読時に「今の値」も流す。これを通すと、ユーザーが何も触っていない
        // 起動直後に colorPicked が 1 回 dispatch されてしまうので、初回だけ捨てる。
        skip(1),
        debounceTime(PICK_DEBOUNCE_MS),
        // debounce 後の値が直前と同じなら dispatch しない（同じ色に戻した場合など）
        distinctUntilChanged(),
        // コンポーネント破棄時に購読を切る。手動の unsubscribe が要らなくなる
        takeUntilDestroyed(),
      )
      .subscribe((color) => {
        this.store.dispatch(ColorPickerFormActions.colorPicked({ color }));
      });

    // 別解: ここでは間引かず毎回 dispatch し、Effect 側で
    //   actions$.pipe(ofType(colorPicked), debounceTime(200), ...)
    // と間引く手もある。「時間の都合は Effect に寄せ、コンポーネントは素朴に保つ」方針なら
    // そちらが筋が良い。反面、store に大量のアクションが流れることは変わらないので、
    // DevTools のログを汚したくない場合は今回のようにコンポーネント側で間引く。
  }

  onColorInput(event: Event): void {
    this.pickedColor.set((event.target as HTMLInputElement).value);
  }
}
