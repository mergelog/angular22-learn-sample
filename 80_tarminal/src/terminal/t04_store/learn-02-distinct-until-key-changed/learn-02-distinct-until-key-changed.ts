import { distinctUntilKeyChanged, from } from 'rxjs';

export function runDistinctUntilKeyChangedExample(): void {
  console.log('--- distinctUntilKeyChanged の例')

  const items = [
    { category: 'A', id: 1 },
    { category: 'A', id: 2 },
    { category: 'B', id: 3 },
    { category: 'A', id: 4 },
    { category: 'A', id: 5 },
  ];

  console.log('入力:', items);

  from(items)
    .pipe(distinctUntilKeyChanged('category'))
    .subscribe((item) => console.log('出力:', item));
}
