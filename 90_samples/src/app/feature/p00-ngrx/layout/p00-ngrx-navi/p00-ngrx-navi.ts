import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-p00-ngrx-navi',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './p00-ngrx-navi.html',
  styleUrl: './p00-ngrx-navi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class P00NgrxNavi {}
