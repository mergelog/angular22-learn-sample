import type { FastifyBaseLogger } from 'fastify';

import type { Lot } from '../contracts/dashboard.contract.js';
import type { LotRepository } from '../repositories/lot.repository.js';

export class LotUpdateScheduler {
  private timeout: NodeJS.Timeout | undefined;
  private updateInProgress: Promise<void> | undefined;
  private stopped = true;

  constructor(
    private readonly lotRepository: LotRepository,
    private readonly intervalMs: number,
    private readonly logger: FastifyBaseLogger,
  ) {
    if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
      throw new Error('Lot update interval must be a positive number.');
    }
  }

  async start(): Promise<void> {
    if (!this.stopped) {
      return;
    }

    this.stopped = false;
    await this.updateLots();
    this.scheduleNextUpdate();
  }

  async stop(): Promise<void> {
    this.stopped = true;

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }

    await this.updateInProgress;
  }

  private scheduleNextUpdate(): void {
    if (this.stopped) {
      return;
    }

    this.timeout = setTimeout(() => {
      const update = this.runUpdateCycle();

      this.updateInProgress = update;

      void update.finally(() => {
        if (this.updateInProgress === update) {
          this.updateInProgress = undefined;
        }
      });
    }, this.intervalMs);
    this.timeout.unref();
  }

  private async runUpdateCycle(): Promise<void> {
    try {
      await this.updateLots();
    } catch (error) {
      this.logger.error(error, 'Failed to update lot data.');
    } finally {
      this.scheduleNextUpdate();
    }
  }

  private async updateLots(): Promise<void> {
    const lots = await this.lotRepository.findAll();
    const updateTime = Date.now();
    const updatedLots = lots.map((lot) => updateLot(lot, updateTime));

    await this.lotRepository.saveAll(updatedLots);
  }
}

function updateLot(lot: Lot, updateTime: number): Lot {
  return {
    ...lot,
    accuracy: nextAccuracy(lot.accuracy),
    updatedAt: nextUpdatedAt(lot.updatedAt, updateTime),
  };
}

function nextAccuracy(currentAccuracy: number): number {
  const nextValue = Number((currentAccuracy + 0.1).toFixed(1));

  return nextValue > 100 ? 99 : nextValue;
}

function nextUpdatedAt(currentUpdatedAt: string, updateTime: number): string {
  const currentTime = Date.parse(currentUpdatedAt);
  const nextTime = Math.max(updateTime, currentTime + 1);

  return new Date(nextTime).toISOString();
}
