import { CafeTableOutput } from './webapp-common/cafe-tables/containers/cafe-table-output/cafe-table-output';

import { routes } from './app.routes';

describe('app routes', () => {
  it('/cafe-status/:tableNumberをoverviewへリダイレクトする', () => {
    const cafeStatusRoute = routes.find((route) => route.path === 'cafe-status');
    const tableRoute = cafeStatusRoute?.children?.find((route) => route.path === ':tableNumber');

    expect(tableRoute).toMatchObject({
      pathMatch: 'full',
      redirectTo: ':tableNumber/overview',
    });
  });

  it('/cafe-status/:tableNumber/overviewで詳細ペインを読み込む', async () => {
    const cafeStatusRoute = routes.find((route) => route.path === 'cafe-status');
    const overviewRoute = cafeStatusRoute?.children?.find(
      (route) => route.path === ':tableNumber/overview',
    );

    expect(overviewRoute?.loadComponent).toBeTypeOf('function');
    await expect(overviewRoute?.loadComponent?.()).resolves.toBe(CafeTableOutput);
  });
});
