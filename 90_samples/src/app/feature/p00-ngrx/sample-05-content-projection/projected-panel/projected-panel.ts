import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sample-05-projected-panel',
  templateUrl: './projected-panel.html',
  styleUrl: './projected-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectedPanel {}
