import { Routes } from '@angular/router';

export const P03_COMPO_ROUTES: Routes = [
  {
    path: 'canvas',
    loadComponent: () => import('./canvas/p03-canvas').then((m) => m.P03Canvas),
  },
  {
    path: 'c01-ng-content',
    loadComponent: () => import('./c01-ng-content/c01-ng-content').then((m) => m.C01NgContent),
  },
  {
    path: 'c02-ng-content-m',
    loadComponent: () =>
      import('./c02-ng-content-m/c02-ng-content-m').then((m) => m.C02NgContentM),
  },
  {
    path: 'c03-ng-template-basic',
    loadComponent: () =>
      import('./c03-ng-template-basic/c03-ng-template-basic').then((m) => m.C03NgTemplateBasic),
  },
  {
    path: 'c04-ng-template-medium',
    loadComponent: () =>
      import('./c04-ng-template-medium/c04-ng-template-medium').then((m) => m.C04NgTemplateMedium),
  },
  {
    path: 'c05-ng-template-input',
    loadComponent: () =>
      import('./c05-ng-template-input/c05-ng-template-input').then((m) => m.C05NgTemplateInput),
  },
  {
    path: 'c06-ng-template-content-child',
    loadComponent: () =>
      import('./c06-ng-template-content-child/c06-ng-template-content-child').then(
        (m) => m.C06NgTemplateContentChild,
      ),
  },
  {
    path: 'c07-ng-template-named-slots',
    loadComponent: () =>
      import('./c07-ng-template-named-slots/c07-ng-template-named-slots').then(
        (m) => m.C07NgTemplateNamedSlots,
      ),
  },
  {
    path: 'c08-ng-template-dynamic',
    loadComponent: () =>
      import('./c08-ng-template-dynamic/c08-ng-template-dynamic').then(
        (m) => m.C08NgTemplateDynamic,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'canvas',
  },
];
