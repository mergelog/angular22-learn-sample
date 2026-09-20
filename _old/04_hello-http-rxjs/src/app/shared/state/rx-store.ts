import { BehaviorSubject, Observable, distinctUntilChanged, map } from "rxjs";

/**
 * RxJS だけで状態を持つ feature store の共通部分。
 *
 * NgRx を入れない規模・段階でも「状態は 1 箇所」「更新はメソッド経由」
 * 「読み取りは Observable」という原則を崩さないための土台。
 * 状態の書き換えは `patch` に限定し、`state$` は外へ公開しない。
 */
export abstract class RxStore<TState extends object> {
  private readonly state$: BehaviorSubject<TState>;

  protected constructor(initialState: TState) {
    this.state$ = new BehaviorSubject<TState>(initialState);
  }

  /** 現在値の同期的な参照。ストリームを組み立てられない箇所からの読み取り専用。 */
  protected get snapshot(): TState {
    return this.state$.value;
  }

  /**
   * 状態の一部を切り出したストリームを作る。
   * `distinctUntilChanged` により、無関係な更新では下流が再計算されない。
   */
  protected select<TSlice>(project: (state: TState) => TSlice): Observable<TSlice> {
    return this.state$.pipe(map(project), distinctUntilChanged());
  }

  /** 差分だけを渡して状態を更新する。常に新しいオブジェクトへ差し替える。 */
  protected patch(partial: Partial<TState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}
