import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-p03-compo-navi',
  imports: [RouterLink],
  templateUrl: './p03-compo-navi.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class P03CompoNavi {}
