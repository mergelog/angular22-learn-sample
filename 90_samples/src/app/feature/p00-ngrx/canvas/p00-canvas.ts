import { Component, inject } from '@angular/core';
import { PushPipe } from '@ngrx/component';
import { Store } from '@ngrx/store';
import { p00CanvasActions, p00CanvasFeature, p00MyCanvasSelectors } from '../store/p00.canvas.store';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';

import {MatIconButton} from '@angular/material/button';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';

@Component({
  selector: 'app-p00-canvas',
  imports: [
    MatIconButton,
    MatFormField,
    MatIconModule,
    MatInput,
    MatLabel,
    MatSuffix,
    P00NgrxNavi,
    PushPipe
  ],
  templateUrl: './p00-canvas.html',
  styleUrl: './p00-canvas.scss',
})
export class P00Canvas {

  private readonly store = inject(Store)
  readonly p00CanvasName$ = this.store.select(p00MyCanvasSelectors.name)
  readonly p00CanvasNum$ = this.store.select(p00CanvasFeature.selectNum)
  readonly p00CanvasStatus$ = this.store.select(p00CanvasFeature.selectStatus)

  // ngrxのSelector → Signals
  readonly p00CanvasName = this.store.selectSignal(
    p00MyCanvasSelectors.name
  )

  changeName(name = '') {
    this.store.dispatch(p00CanvasActions.changeName({ name }))
  }

  clearName() {
    if (this.p00CanvasName() === '') {
      return; 
    }
    this.store.dispatch(p00CanvasActions.changeName({ name: '' }))
  }

}
