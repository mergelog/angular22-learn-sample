export interface ReportRow {
  readonly id: number;
  readonly service: string;
  readonly status: '成功' | '確認中';
  readonly updatedAt: string;
  readonly owner: string;
}

export interface ReportRowTemplateContext {
  readonly $implicit: ReportRow;
  readonly row: ReportRow;
  readonly index: number;
}
