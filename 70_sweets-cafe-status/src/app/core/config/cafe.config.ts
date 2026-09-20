import { InjectionToken } from '@angular/core';

export interface SweetsMenuItem {
  readonly name: string;
  readonly priceYen: number;
  readonly caloriesKcal: number;
  readonly cookingTimeMinutes: number;
}

export interface CafeConfig {
  readonly seatCount: number;
  readonly hallStaffCount: number;
  readonly kitchenStaffCount: number;
  readonly dashboardUpdateIntervalMs: number;
  readonly backendUpdateIntervalMs: number;
  readonly apiResponseDelayMinMs: number;
  readonly apiResponseDelayMaxMs: number;
  readonly maxOrderHistoryCount: number;
  readonly sweetsMenu: readonly SweetsMenuItem[];
}

// [■観点:InjectionToken] 設定オブジェクトを DI で共有するための識別子です。factory でデフォルト値を用意しています。
export const CAFE_CONFIG = new InjectionToken<CafeConfig>('CAFE_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    // 客席の総数です。
    seatCount: 12,
    // 接客を担当するホールスタッフの人数です。
    hallStaffCount: 3,
    // 調理を担当するキッチンスタッフの人数です。
    kitchenStaffCount: 2,
    // ダッシュボードを更新する間隔（ミリ秒）です。
    dashboardUpdateIntervalMs: 60000,
    // バックエンド内のカフェ状態を更新する間隔（ミリ秒）です。
    backendUpdateIntervalMs: 2_000,
    // APIレスポンスを返すまでの最短待ち時間（ミリ秒）です。
    apiResponseDelayMinMs: 500,
    // APIレスポンスを返すまでの最長待ち時間（ミリ秒）です。
    apiResponseDelayMaxMs: 1_000,
    // バックエンドに保持する注文履歴の最大件数です。
    maxOrderHistoryCount: 300,
    // 提供するスイーツのメニューです。
    sweetsMenu: [
      { name: '苺のSC', priceYen: 680, caloriesKcal: 420, cookingTimeMinutes: 10 },
      { name: '濃厚CS', priceYen: 620, caloriesKcal: 460, cookingTimeMinutes: 12 },
      { name: '季節のFT', priceYen: 720, caloriesKcal: 380, cookingTimeMinutes: 15 },
      { name: 'プリンAM', priceYen: 480, caloriesKcal: 290, cookingTimeMinutes: 5 },
    ],
  }),
});
