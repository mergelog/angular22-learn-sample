import { Component, output } from '@angular/core';
import { P00NoviceCard } from './p00-novice-card';

@Component({
  selector: 'app-p00-novice-add-card',
  imports: [P00NoviceCard],
  templateUrl: './p00-novice-add-card.html',
  styleUrl: './p00-novice-add-card.scss',
})
export class P00NoviceAddCard {
  readonly addCard = output<void>();
}
