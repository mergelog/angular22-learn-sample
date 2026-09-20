import { Directive, input, TemplateRef } from '@angular/core';

/**
 * PrimeNG の pTemplate と同じ考え方を、依存を増やさずに示す最小 Directive。
 */
@Directive({ selector: 'ng-template[pTemplate]' })
export class PTemplate {
  readonly name = input.required<string>({ alias: 'pTemplate' });

  constructor(readonly templateRef: TemplateRef<unknown>) {}
}
