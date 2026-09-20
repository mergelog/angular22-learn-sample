import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { DEFAULT_BACKGROUND_COLOR } from '../../features/color/color.constants';

const SYNCED_ON_COLOR = '#16a34a';

@Injectable()
export class ColorSyncService {
  /**
   * 戻り値は Observable なので、この関数を呼んだだけでは何も起きない。
   * 購読されて初めて処理が走る（cold observable）。
   */
  syncColor(isOn: boolean): Observable<string> {
    const color = isOn ? SYNCED_ON_COLOR : DEFAULT_BACKGROUND_COLOR;

    // 実アプリではここが HTTP リクエストや localStorage 書き込みなどの副作用になる。
    return of(color).pipe(delay(350));
  }
}
