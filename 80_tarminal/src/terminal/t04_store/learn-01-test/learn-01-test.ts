import { of, pairwise } from "rxjs";

export function learn01Test() {
  console.log('--- test の例')

  console.log('hello test')

  of(10, 20, 35).pipe(
    pairwise()
  ).subscribe(([previous, current]) => {
    console.log(previous, current);
  });
}
