import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AddReservationRequest,
  CafeDashboard,
  CafeOrder,
  CafeTable,
  UpdateTableRequest,
} from '../model/cafe-status.model';

const API_URL = '/api/cafe-status';
const ORDERS_API_URL = '/api/cafe-orders';

@Injectable({ providedIn: 'root' })
export class CafeDashboardApi {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<CafeDashboard> {
    return this.http.get<CafeDashboard>(API_URL);
  }

  getOrders(): Observable<readonly CafeOrder[]> {
    return this.http.get<readonly CafeOrder[]>(ORDERS_API_URL);
  }

  updateTable(request: UpdateTableRequest): Observable<CafeTable> {
    return this.http.put<CafeTable>(API_URL, request);
  }

  clearTable(tableNumber: string): Observable<CafeTable> {
    return this.http.delete<CafeTable>(`${API_URL}/${encodeURIComponent(tableNumber)}`);
  }

  addReservation(tableNumber: string, request: AddReservationRequest): Observable<CafeTable> {
    return this.http.post<CafeTable>(
      `${API_URL}/${encodeURIComponent(tableNumber)}/reservations`,
      request,
    );
  }
}
