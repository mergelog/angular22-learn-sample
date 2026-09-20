import type { SsDashboardResponseDto } from './ss-dashboard.dto';
import type { SsDashboard } from './ss-dashboard.model';

export function mapSsDashboardResponse(dto: SsDashboardResponseDto): SsDashboard {
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
