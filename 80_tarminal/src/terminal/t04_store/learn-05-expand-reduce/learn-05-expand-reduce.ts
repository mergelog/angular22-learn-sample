import { EMPTY, expand, of, reduce } from 'rxjs';

type Page = {
  items: string[];
  nextPage: number | null;
};

const pages: Record<number, Page> = {
  1: { items: ['A', 'B'], nextPage: 2 },
  2: { items: ['C', 'D'], nextPage: 3 },
  3: { items: ['E'], nextPage: null },
};

function fetchPage(pageNumber: number) {
  console.log(`取得: ${pageNumber} ページ目`);
  return of(pages[pageNumber]);
}

export function runExpandReduceExample(): void {
  console.log('--- expand + reduce の例');

  fetchPage(1)
    .pipe(
      expand((page) => page.nextPage === null ? EMPTY : fetchPage(page.nextPage)),
      reduce((allItems, page) => [...allItems, ...page.items], [] as string[]),
    )
    .subscribe((items) => console.log('全ページの結果:', items));
}
