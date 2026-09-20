import type { DashboardResponseDto } from './dashboard.dto';
import type { Dashboard } from './dashboard.model';

export function mapDashboardResponse(dto: DashboardResponseDto): Dashboard {
  return {
    items: dto.items.map((item) => ({
      lotName: item.lotName,
      waferCount: item.waferCount,
      accuracy: item.accuracy,
      status: item.status,
      updatedAt: item.updatedAt,
    })),
  };
}
