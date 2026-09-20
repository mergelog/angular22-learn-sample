import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';

import type { FooListResponseDto } from '../../../web-app-common/store/foo/foo.dto';

const FOO_LIST_URL = '/api/foo';
const RESPONSE_LATENCY_MS = 200;

/** ポーリングのたびに値が変わることを見せるためのカウンタ */
let requestCount = 0;

/**
 * listing-foo 用のスタブバックエンド。
 * /api/foo の GET だけを横取りし、それ以外は次のハンドラへ流す。
 * app.config.ts の withInterceptors で登録している。
 */
export const fooBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || !req.url.startsWith(FOO_LIST_URL)) {
    return next(req);
  }

  return of(new HttpResponse({ status: 200, body: createFooListResponse() })).pipe(
    delay(RESPONSE_LATENCY_MS),
  );
};

function createFooListResponse(): FooListResponseDto {
  requestCount += 1;
  const updatedAt = new Date().toISOString();

  return {
    items: [
      {
        fooId: 'foo-001',
        fooName: 'alpha',
        count: requestCount,
        status: 'running',
        updatedAt,
      },
      {
        fooId: 'foo-002',
        fooName: 'bravo',
        count: requestCount * 2,
        status: 'running',
        updatedAt,
      },
      {
        fooId: 'foo-003',
        fooName: 'charlie',
        count: 0,
        status: 'idle',
        updatedAt,
      },
    ],
  };
}
