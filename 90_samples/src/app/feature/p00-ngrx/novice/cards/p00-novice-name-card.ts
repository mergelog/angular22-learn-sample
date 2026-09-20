import { Component, input, output } from '@angular/core';
import { P00NoviceCard as P00NoviceCardModel } from '../../store/P00.novice.store';
import { P00NoviceCard } from './p00-novice-card';

@Component({
  selector: 'app-p00-novice-name-card',
  imports: [P00NoviceCard],
  templateUrl: './p00-novice-name-card.html',
  styleUrl: './p00-novice-name-card.scss',
})
export class P00NoviceNameCard {
  readonly card = input.required<P00NoviceCardModel>();
  readonly nameChange = output<{ id: number; name: string }>();

  changeName(event: Event): void {
    const name = (event.target as HTMLInputElement).value;
    this.nameChange.emit({ id: this.card().id, name });
  }
}
