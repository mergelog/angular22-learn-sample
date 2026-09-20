import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { FooListResponseDto } from './foo.dto';

/** 実際のレスポンスは mod-httpInterceptorFn のスタブが返す */
@Injectable()
export class FooApi {
  private readonly http = inject(HttpClient);

  getFooList(): Observable<FooListResponseDto> {
    return this.http.get<FooListResponseDto>('/api/foo');
  }
}
