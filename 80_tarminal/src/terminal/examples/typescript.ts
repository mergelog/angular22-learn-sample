export function runTypeScriptExample(): void {
  const values: number[] = [1, 2, 3];
  const doubled = values.map((value) => value * 2);

  console.log('TypeScript:', doubled);
}
