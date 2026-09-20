import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chart {}
