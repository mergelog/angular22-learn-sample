import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { PTemplate } from './template-slot/p-template';
import { TemplateSlot } from './template-slot/template-slot';

@Component({
  selector: 'app-sample-08-content-children',
  imports: [P00NgrxNavi, PTemplate, TemplateSlot],
  templateUrl: './sample-08-content-children.html',
  styleUrl: './sample-08-content-children.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample08ContentChildren {}
