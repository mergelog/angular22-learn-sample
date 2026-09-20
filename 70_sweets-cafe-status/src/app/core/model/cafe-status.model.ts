// テーブルが取り得る店内ステータスの一覧です。
export const TABLE_STATUSES = ['空き', '未オーダー', '調理中', '提供済', '片付け中'] as const;

// テーブルの店内ステータスです。
export type TableStatus = (typeof TABLE_STATUSES)[number];

// テーブルの設置場所・種類です。
export type TableClassification = 'カウンター' | 'テーブル' | 'テラス';

// ステータスごとの累計滞在時間（秒）です。
export type StatusDurationsSeconds = Readonly<Record<TableStatus, number>>;

export interface CafeTable {
  // テーブルを識別する番号です。
  readonly tableNumber: string;
  // テーブルの設置場所・種類です。
  readonly classification: TableClassification;
  // 現在の利用ステータスです。
  readonly status: TableStatus;
  // 現在このテーブルを利用している来客の ID 一覧です。
  readonly guestIds: readonly string[];
  // このテーブルに登録されている予約の一覧です。
  readonly 予約: readonly CafeReservation[];
  // 現在のステータスになってからの経過時間（秒）です。
  readonly stateElapsedSeconds: number;
  // ステータスごとの累計滞在時間（秒）です。
  readonly statusDurationsSeconds: StatusDurationsSeconds;
  // 現在テーブルにいる来客数です。
  readonly people: number;
  // このテーブルの現在の会計金額（円）です。
  readonly billingAmount: number;
  // 営業時間に対する当日の利用率（%）です。
  readonly dailyUsageRate: number;
}

export interface CafeReservation {
  // 予約日時（ISO 8601 形式）です。
  readonly 予約時間: string;
  // 予約時の滞在予定時間（分）です。
  readonly 滞在予定時間: number;
  // 予約者の名前です。
  readonly 予約名: string;
  // 予約人数です。
  readonly 人数: number;
}

// 指定テーブルへ追加する予約の内容です。
export type AddReservationRequest = CafeReservation;

export interface CafeGuest {
  // 来客を一意に識別する ID です。
  readonly id: string;
  // 来客が着席したテーブル番号です。
  readonly tableNumber: string;
  // 来客が着席した日時（ISO 8601 形式）です。
  readonly seatedAt: string;
}

export interface CafeOrder {
  // 注文を一意に識別する ID です。
  readonly id: string;
  // 注文確定時に同じテーブルを利用していた来客の ID 一覧です。
  readonly guestIds: readonly string[];
  // 注文を受けたテーブル番号です。
  readonly tableNumber: string;
  // 注文に関連する所要時間です。
  readonly durations: {
    // 注文確定時点の滞在時間（秒）です。
    readonly staySeconds: number;
    // 着席から注文確定までにかかった時間（ミリ秒）です。
    readonly orderMs: number;
    // 注文確定から提供までにかかった時間（ミリ秒）です。提供前は未設定です。
    readonly cookingMs?: number;
    // 提供から退席までにかかった時間（ミリ秒）です。退席前は未設定です。
    readonly mealMs?: number;
  };
  // 注文したスイーツの名称です。
  readonly menuName: string;
  // 注文したスイーツの価格（円）です。
  readonly priceYen: number;
  // 注文を確定した日時（ISO 8601 形式）です。
  readonly orderedAt: string;
}

export interface CafeDashboard {
  // ダッシュボード情報を生成した日時（ISO 8601 形式）です。
  readonly generatedAt: string;
  // 現在勤務しているスタッフ数です。
  readonly staff: {
    // ホールスタッフ数です。
    readonly hall: number;
    // キッチンスタッフ数です。
    readonly kitchen: number;
  };
  // 当日の座席利用状況です。
  readonly seats: {
    // 当日に利用した来客数です。
    readonly usedToday: number;
    // 当日の予約来客数です。
    readonly reservedToday: number;
    // 店内の総座席数です。
    readonly total: number;
  };
  // 全テーブルの現在の状況です。
  readonly tables: readonly CafeTable[];
}

export interface UpdateTableRequest {
  // 更新対象のテーブル番号です。
  readonly tableNumber: string;
  // 更新後のテーブルステータスです。
  readonly status: TableStatus;
  // 更新後の来客数です。省略時は現在の人数を使用します。
  readonly people?: number;
  // 更新後の会計金額（円）です。省略時は現在の金額を使用します。
  readonly billingAmount?: number;
}
