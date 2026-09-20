import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { provideState, Store } from '@ngrx/store';

import { aSampleActions, aSampleFeature, aSampleSelectors } from '../a-sample.store';

import { AsyncPipe } from '@angular/common';

@Component({
  imports: [
    RouterLink,
    AsyncPipe
  ],
  selector: 'app-a-sample',
  styleUrl: './a-sample.scss',
  templateUrl: './a-sample.html'
})
export class ASample {

  private readonly store = inject(Store)
  readonly aSample$ = this.store.select(aSampleSelectors.name)

  changeName(name = '') {
    this.store.dispatch(aSampleActions.changeName({ name }))
  }

}
