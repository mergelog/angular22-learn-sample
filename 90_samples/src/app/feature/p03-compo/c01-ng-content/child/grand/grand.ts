import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-c01-grand',
  templateUrl: './grand.html',
  styleUrl: './grand.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Grand {}
