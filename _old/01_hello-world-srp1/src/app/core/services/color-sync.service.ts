import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

@Injectable()
export class ColorSyncService {
  syncColor(isOn: boolean): Observable<string> {
    const color = isOn ? '#16a34a' : '#64748b';

    // 実アプリではここが HTTP リクエストや localStorage 書き込みなどの副作用になる。
    return of(color).pipe(delay(350));
  }
}
