import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { P03CompoNavi } from '../layout/p03-compo-navi/p03-compo-navi';

@Component({
  selector: 'app-c03-ng-template-basic',
  imports: [NgTemplateOutlet, P03CompoNavi],
  templateUrl: './c03-ng-template-basic.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class C03NgTemplateBasic {}
