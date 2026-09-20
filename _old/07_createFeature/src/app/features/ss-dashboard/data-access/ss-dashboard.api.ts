import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { SsDashboardResponseDto } from './ss-dashboard.dto';

@Injectable()
export class SsDashboardApi {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<SsDashboardResponseDto> {
    return this.http.get<SsDashboardResponseDto>('/api/dashboard');
  }
}
