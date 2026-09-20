/** API のレスポンス 1 行分。`kind` は API 側の都合でただの文字列として受ける。 */
export interface AnimalDto {
  accountId: string;
  name: string;
  kind: string;
  age: number;
  weight: number;
}

/** 一覧 API のレスポンス全体。配列は `animals` でラップされている。 */
export interface AnimalsResponseDto {
  animals: AnimalDto[];
}
