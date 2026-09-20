import { constants } from 'node:fs';
import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { Lot } from '../contracts/dashboard.contract.js';
import type { LotRepository } from './lot.repository.js';

export class JsonLotRepository implements LotRepository {
  constructor(
    private readonly filePath: string,
    private readonly initialLots: readonly Lot[],
  ) {}

  async findAll(): Promise<readonly Lot[]> {
    await this.ensureDataFile();

    const content = await readFile(this.filePath, 'utf8');

    if (!content.trim()) {
      return this.restoreInitialLots();
    }

    const data: unknown = JSON.parse(content);

    if (!Array.isArray(data) || !data.every(isLot)) {
      throw new Error(`Invalid lot data in ${this.filePath}.`);
    }

    if (data.length === 0) {
      return this.restoreInitialLots();
    }

    return data;
  }

  async saveAll(lots: readonly Lot[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });

    const temporaryFilePath = `${this.filePath}.${process.pid}.tmp`;

    await writeFile(temporaryFilePath, `${JSON.stringify(lots, null, 2)}\n`, 'utf8');
    await rename(temporaryFilePath, this.filePath);
  }

  private async ensureDataFile(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });

    try {
      await access(this.filePath, constants.F_OK);
    } catch {
      await this.saveAll(this.initialLots);
    }
  }

  private async restoreInitialLots(): Promise<readonly Lot[]> {
    await this.saveAll(this.initialLots);

    return this.initialLots;
  }
}

function isLot(value: unknown): value is Lot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const lot = value as Record<string, unknown>;

  return (
    typeof lot['lotName'] === 'string' &&
    typeof lot['waferCount'] === 'number' &&
    typeof lot['accuracy'] === 'number' &&
    lot['status'] === 'processing' &&
    typeof lot['updatedAt'] === 'string' &&
    !Number.isNaN(Date.parse(lot['updatedAt']))
  );
}
