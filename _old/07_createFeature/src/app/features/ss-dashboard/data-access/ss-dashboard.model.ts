export interface SsDashboard {
  items: readonly SsLot[];
}

export interface SsLot {
  lotName: string;
  waferCount: number;
  accuracy: number;
  status: 'processing';
  updatedAt: string;
}
