import type { FooListResponseDto } from './foo.dto';
import type { FooList } from './foo.model';

export function mapFooListResponse(dto: FooListResponseDto): FooList {
  return {
    items: dto.items.map((item) => ({
      fooId: item.fooId,
      fooName: item.fooName,
      count: item.count,
      status: item.status,
      updatedAt: item.updatedAt,
    })),
  };
}
