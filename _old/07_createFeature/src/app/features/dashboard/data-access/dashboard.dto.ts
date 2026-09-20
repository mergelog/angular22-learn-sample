export interface DashboardResponseDto {
  items: readonly LotDto[];
}

export interface LotDto {
  lotName: string;
  waferCount: number;
  accuracy: number;
  status: 'processing';
  updatedAt: string;
}
