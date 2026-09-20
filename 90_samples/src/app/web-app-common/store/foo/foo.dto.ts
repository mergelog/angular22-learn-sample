export interface FooListResponseDto {
  items: readonly FooDto[];
}

export interface FooDto {
  fooId: string;
  fooName: string;
  count: number;
  status: 'idle' | 'running';
  updatedAt: string;
}
