import { Directive, input } from '@angular/core';

@Directive()
export abstract class NameBase {
  readonly name = input.required<string>();
}
