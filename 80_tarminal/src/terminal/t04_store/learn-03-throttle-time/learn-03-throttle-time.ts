import { Subject, throttleTime } from 'rxjs';

export function runThrottleTimeExample(): void {
  console.log('--- throttleTime の例');

  const input$ = new Subject<string>();

  input$
    .pipe(throttleTime(500))
    .subscribe((value) => console.log('出力:', value));

  const events = [
    { delay: 0, value: 'A' },
    { delay: 100, value: 'B' },
    { delay: 200, value: 'C' },
    { delay: 800, value: 'D' },
  ];

  for (const { delay, value } of events) {
    setTimeout(() => {
      console.log(`入力 (${delay}ms):`, value);
      input$.next(value);
    }, delay);
  }

  setTimeout(() => input$.complete(), 900);
}
