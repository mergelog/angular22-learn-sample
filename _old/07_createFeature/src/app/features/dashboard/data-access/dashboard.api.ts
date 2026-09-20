import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { DashboardResponseDto } from './dashboard.dto';

@Injectable()
export class DashboardApi {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<DashboardResponseDto> {
    return this.http.get<DashboardResponseDto>('/api/dashboard');
  }
}
