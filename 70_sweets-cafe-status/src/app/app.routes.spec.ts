import { routes } from './app.routes';

describe('app routes', () => {
  it('/cafe-status/:tableNumberをoverviewへリダイレクトする', () => {
    const cafeStatusRoute = routes.find((route) => route.path === 'cafe-status');
    const tableRoute = cafeStatusRoute?.children?.find(
      (route) => route.path === ':tableNumber',
    );

    expect(tableRoute).toMatchObject({
      pathMatch: 'full',
      redirectTo: ':tableNumber/overview',
    });
  });
});
