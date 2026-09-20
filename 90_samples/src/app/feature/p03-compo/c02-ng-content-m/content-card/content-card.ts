import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-c02-content-card',
  templateUrl: './content-card.html',
  styleUrl: './content-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentCard {}
