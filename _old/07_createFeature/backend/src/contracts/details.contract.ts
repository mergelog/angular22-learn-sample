export type DetailStatus = 'active' | 'completed';

export interface Detail {
  id: string;
  title: string;
  description: string;
  status: DetailStatus;
}

export type DetailHistoryType = 'created' | 'updated';

export interface DetailHistoryItem {
  id: string;
  occurredAt: string;
  type: DetailHistoryType;
}
