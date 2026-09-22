import { finalize, of, Subject, throwError } from 'rxjs';

export function runFinalizeExample(): void {
  console.log('--- finalize の例');

  of('A')
    .pipe(finalize(() => console.log('finalize: complete!!!')))
    .subscribe({
      next: (value) => console.log('出力:', value),
      complete: () => console.log('完了'),
    });

  throwError(() => new Error('失敗'))
    .pipe(finalize(() => console.log('finalize: error!!!')))
    .subscribe({ error: (error: Error) => console.log('エラー:', error.message) });

  const input$ = new Subject<string>();
  const subscription = input$
    .pipe(finalize(() => console.log('finalize: unsubscribe!!!')))
    .subscribe((value) => console.log('出力:', value));

  input$.next('B');
  subscription.unsubscribe();
}
