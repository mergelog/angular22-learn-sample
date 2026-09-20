export interface FooList {
  items: readonly Foo[];
}

export interface Foo {
  fooId: string;
  fooName: string;
  count: number;
  status: 'idle' | 'running';
  updatedAt: string;
}
