import { Directive, input, TemplateRef } from '@angular/core';

export type TemplateSlot = 'header' | 'body' | 'empty';

@Directive({
  selector: 'ng-template[c07Template]',
})
export class C07Template {
  readonly slot = input.required<TemplateSlot>({ alias: 'c07Template' });

  constructor(readonly template: TemplateRef<unknown>) {}
}
