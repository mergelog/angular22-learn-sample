import { Actions, createEffect, ofType } from '@ngrx/effects';
import { createAction, props } from '@ngrx/store';
import { finalize, map, Observable, of, Subject, switchMap, takeUntil, takeWhile, timer } from 'rxjs';

type Scenario = '完了ステータス' | '画面離脱';
type Status = '処理中' | '完了';

/** `画面を開いた`を表すアクション */
const pageOpened = createAction('[Page] Opened', props<{ scenario: Scenario }>());
/** `画面を離れた`を表すアクション */
const pageLeft = createAction('[Page] Left');
/** `ステータスを受信した`を表すアクション */
const statusReceived = createAction('[API] Status Received', props<{ scenario: Scenario; status: Status }>());

/**
 * statusを決定して、`\d回目の取得 → ${status}`を表示する  
 * Statusは、`scenario === '完了ステータス' && tick === 2`を満たさないと '処理中' となる。
 * 
 * @return Observable<status>
 */
function fetchStatus(scenario: Scenario, tick: number): Observable<Status> {
  const status: Status = scenario === '完了ステータス' && tick === 2 ? '完了' : '処理中';
  console.log(`${scenario}: ${tick + 1}回目の取得 → ${status}`);
  return of(status);
}

/**
 * まず(1)から始まる
 */
export function runTimerTakeWhileTakeUntilExample(): void {
  console.log('--- timer + takeWhile + takeUntil(ofType) の例');

  /** pageOpened と pageLeft のUNION型 */
  const actionSubject = new Subject<ReturnType<typeof pageOpened> | ReturnType<typeof pageLeft>>();

  // 別のイベントを作っているわけではなく、actionSubject.next(...) で流した値が actions$ に届きます。
  // これはターミナルで Effect を再現するための書き方です。
  // 通常の NgRx アプリでは Actions は NgRx から受け取り、アクションは store.dispatch(...) で流すので
  // Subject も new Actions(...) も自分では作りません。
  /* --- Subject を NgRx の Actions として扱うためのラッパー --- */
  const actions$ = new Actions(actionSubject); 

  /** effectの設定 */
  const pollingEffect$ = createEffect(
    () => actions$.pipe( // (2): actions$ に届く
      ofType(pageOpened),
      switchMap(({ scenario }) => // scenario は pageOpened の型。最初は(1)から`'完了ステータス'`が流れてくる
        //
        //　timer(0, 100) を2回、それぞれ新しく購読
        //  - 1回目：「完了ステータス」用。tick は 0 → 1 → 2 で停止
        //  - 2回目：「画面離脱」用。tick は再び 0 から始まり、pageLeft で停止
        // 
        timer(0, 100).pipe(
          switchMap((tick) => /* (3) */ fetchStatus(scenario, tick)), // timerが出す index を使って fetchStatus() を呼ぶ
          takeWhile((status) => status === '処理中', true),            // [!] APIが「処理中」の間だけポーリング継続
          takeUntil(actions$.pipe(ofType(pageLeft))),                 // [!] Page Left が来たら強制終了
          map((status) => statusReceived({ scenario, status })),      // 取得結果をActionに変換
          finalize(() => console.log(`${scenario}: 定期取得を停止`)),   // どんな理由でも終了したら実行（注意: この finalize は timer内 にかかっている　）
        )),
    ));

  /** 画面離脱数 */
  let leavePageResults = 0;

  /** 購読開始 */
  pollingEffect$.subscribe(({ scenario, status }) => {
    // console.log(`Effect の 出力を受信:[`, scenario, status, ']');

    if (scenario === '完了ステータス' && status === '完了') {
      setTimeout(() => actionSubject.next(pageOpened({ scenario: '画面離脱' })), 0);
    }

    // 
    if (scenario === '画面離脱' && ++leavePageResults === 3) {
      setTimeout(() => {
        console.log('画面離脱: Page Left を dispatch');
        actionSubject.next(pageLeft()); // `画面を離れた`自体を通知する
      }, 0);
    }
  });

  actionSubject.next(pageOpened({ scenario: '完了ステータス' })); // (1) 最初のトリガー

  /**
   * 実務のレビューなら指摘される可能性が高いです。
   * 
   * 特に、subscribe の中で次のアクションを流す処理、
   * setTimeout、
   * 2つの scenario を1つにまとめた部分は、
   * 2つの動作をターミナルで見せるための仕掛けです。
   * 
   * 実際の Effect では、Actions は NgRx から受け取り、画面を開く・離れるアクションは画面側から流します。
   * それでも定期取得には複数の停止条件があるので、そこは関数に分けて名前を付け、停止時の動作をテストしたくなるコードです。
   * 
   * 学習用としては、このまま全体の流れを追えることに価値があります。
   */
}
