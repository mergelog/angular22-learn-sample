
## merge

```ts
import { merge, of } from 'rxjs';
import { delay } from 'rxjs/operators';

const a$ = of('A1', 'A2').pipe(delay(100));
const b$ = of('B1', 'B2');

merge(a$, b$).subscribe(console.log);

// B1
// B2
// A1
// A2
```

## concat

```ts
import { concat, of } from 'rxjs';

const a$ = of('A1', 'A2');
const b$ = of('B1', 'B2');

concat(a$, b$).subscribe(console.log);

// A1
// A2
// B1
// B2
```

## combineLatestWith [pipe]

```ts
import { interval } from 'rxjs';
import { combineLatestWith, take } from 'rxjs/operators';

const a$ = interval(1000).pipe(take(3));
const b$ = interval(1500).pipe(take(3));

a$
  .pipe(combineLatestWith(b$))
  .subscribe(console.log);

// [0, 0]
// [1, 0]
// [2, 0]
// [2, 1]
// [2, 2]
```

## mergeMap [pipe]

```ts
import { of } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';

of(1, 2, 3)
  .pipe(
    mergeMap(id =>
      of(`result: ${id}`).pipe(
        delay(1000)
      )
    )
  )
  .subscribe(console.log);

// result: 1
// result: 2
// result: 3
```

## concatMap [pipe]

```ts
import { of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';

of(1, 2, 3)
  .pipe(
    concatMap(id =>
      of(`result: ${id}`).pipe(
        delay(1000)
      )
    )
  )
  .subscribe(console.log);

// result: 1  // 約1秒後
// result: 2  // 約2秒後
// result: 3  // 約3秒後
```
