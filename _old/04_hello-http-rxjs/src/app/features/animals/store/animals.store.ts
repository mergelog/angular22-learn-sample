import { DestroyRef, Injectable, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  Observable,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  tap,
} from "rxjs";
import { toApiErrorMessage } from "@core/http/api-error";
import { RxStore } from "@shared/state/rx-store";
import { AnimalsApi } from "../data-access/animals.api";
import { AnimalsState, INITIAL_ANIMALS_STATE } from "./animals.state";

/** キーワード入力を状態へ反映するまでの待ち時間（ミリ秒）。 */
const KEYWORD_DEBOUNCE_MS = 250;

/**
 * 動物一覧画面の状態を持つ store。
 *
 * NgRx の代わりに RxJS だけで組んでいるが、責務の切り方は同じ。
 * - 画面からの入力はメソッドで受ける（= action 相当）
 * - HTTP は Subject をトリガーにした 1 本のストリームで扱う（= effect 相当）
 * - 画面へは Observable だけを公開する（= selector 相当）
 */
@Injectable()
export class AnimalsStore extends RxStore<AnimalsState> {
  private readonly animalsApi = inject(AnimalsApi);
  private readonly destroyRef = inject(DestroyRef);

  /** 「読み込み直せ」という合図だけを流すトリガー。値は持たない。 */
  private readonly reload$ = new Subject<void>();

  /** 入力ボックスの生の値。debounce 前なのでキーストロークごとに流れる。 */
  private readonly keywordInput$ = new Subject<string>();

  readonly animals$ = this.select((state) => state.animals);
  readonly keyword$ = this.select((state) => state.keyword);
  readonly error$ = this.select((state) => state.error);
  readonly isLoading$ = this.select((state) => state.status === "loading");

  /** 「40 件中 12 件を表示」のようなサマリ。全件数と表示件数の両方に追従する。 */
  readonly summary$: Observable<string> = combineLatest([
    this.select((state) => state.animals.length),
    this.select((state) => state.visibleCount),
  ]).pipe(map(([total, visible]) => `${total} 件中 ${visible} 件を表示`));

  constructor() {
    super(INITIAL_ANIMALS_STATE);

    this.connectLoadAnimals();
    this.connectKeywordInput();
  }

  /** 画面表示時と再読み込みボタンから呼ばれる。 */
  load(): void {
    this.reload$.next();
  }

  /** キーワード入力。debounce は store 側の責務なので、画面は毎回そのまま流してよい。 */
  changeKeyword(keyword: string): void {
    this.keywordInput$.next(keyword);
  }

  /** AG Grid がフィルタを適用した結果の行数を受け取る。 */
  reportVisibleCount(visibleCount: number): void {
    if (this.snapshot.visibleCount !== visibleCount) {
      this.patch({ visibleCount });
    }
  }

  /**
   * reload$ を HTTP に接続する。
   *
   * switchMap なので、応答を待たずに再読み込みしても古い方は破棄される。
   * catchError は内側の Observable に置くこと。外側に置くとストリームごと終了し、
   * 2 回目以降の reload$ が届かなくなる。
   */
  private connectLoadAnimals(): void {
    this.reload$
      .pipe(
        tap(() => this.patch({ status: "loading", error: null })),
        switchMap(() =>
          this.animalsApi.loadAnimals().pipe(
            map((animals): Partial<AnimalsState> => ({
              animals,
              status: "success",
              error: null,
              visibleCount: animals.length,
            })),
            catchError((error: unknown) =>
              of<Partial<AnimalsState>>({
                animals: [],
                status: "error",
                error: toApiErrorMessage(error),
                visibleCount: 0,
              }),
            ),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((partial) => this.patch(partial));
  }

  /** 入力が落ち着いてから state に載せ、グリッドの再フィルタ回数を抑える。 */
  private connectKeywordInput(): void {
    this.keywordInput$
      .pipe(
        debounceTime(KEYWORD_DEBOUNCE_MS),
        map((keyword) => keyword.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((keyword) => this.patch({ keyword }));
  }
}
