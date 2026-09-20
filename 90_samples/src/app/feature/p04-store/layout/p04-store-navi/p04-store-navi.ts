import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-p04-store-navi',
  imports: [RouterLink],
  templateUrl: './p04-store-navi.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class P04StoreNavi {}
