import type { Lot } from '../contracts/dashboard.contract.js';

export interface LotRepository {
  findAll(): Promise<readonly Lot[]>;
  saveAll(lots: readonly Lot[]): Promise<void>;
}
