export interface Dashboard {
  items: readonly Lot[];
}

export interface Lot {
  lotName: string;
  waferCount: number;
  accuracy: number;
  status: 'processing';
  updatedAt: string;
}
