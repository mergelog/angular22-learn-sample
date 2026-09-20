import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import {
  p00NoviceActions,
  p00NoviceSelectors,
} from '../store/P00.novice.store';
import { P00NoviceAddCard } from './cards/p00-novice-add-card';
import { P00NoviceNameCard } from './cards/p00-novice-name-card';

@Component({
  selector: 'app-p00-novice',
  imports: [P00NgrxNavi, P00NoviceAddCard, P00NoviceNameCard],
  templateUrl: './p00-novice.html',
  styleUrl: './p00-novice.scss',
})
export class P00Novice {
  private readonly store = inject(Store);

  readonly cards = this.store.selectSignal(p00NoviceSelectors.cards);

  addCard(): void {
    this.store.dispatch(p00NoviceActions.cardAddClicked());
  }

  changeCardName(change: { id: number; name: string }): void {
    this.store.dispatch(p00NoviceActions.cardNameChanged(change));
  }
}
