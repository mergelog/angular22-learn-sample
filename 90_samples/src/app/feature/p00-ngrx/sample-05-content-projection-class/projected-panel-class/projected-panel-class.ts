import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sample-05-projected-panel-class',
  templateUrl: './projected-panel-class.html',
  styleUrl: './projected-panel-class.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectedPanelClass {}
