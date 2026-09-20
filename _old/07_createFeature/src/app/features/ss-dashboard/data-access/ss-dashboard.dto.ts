export interface SsDashboardResponseDto {
  items: readonly SsLotDto[];
}

export interface SsLotDto {
  lotName: string;
  waferCount: number;
  accuracy: number;
  status: 'processing';
  updatedAt: string;
}
