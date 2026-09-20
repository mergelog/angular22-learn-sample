export interface DashboardResponse {
  items: readonly Lot[];
}

export interface DashboardErrorResponse {
  code: 'DASHBOARD_TEMPORARY_FAILURE';
  message: string;
}

export interface Lot {
  lotName: string;
  waferCount: number;
  accuracy: number;
  status: 'processing';
  updatedAt: string;
}
