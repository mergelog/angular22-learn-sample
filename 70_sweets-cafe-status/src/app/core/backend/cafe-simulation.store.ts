import { DestroyRef, Injectable, inject } from '@angular/core';

import { CAFE_CONFIG } from '../config/cafe.config';
import {
  CafeDashboard,
  CafeGuest,
  CafeOrder,
  CafeReservation,
  CafeTable,
  TableClassification,
  TableStatus,
  UpdateTableRequest,
} from '../model/cafe-status.model';
import { toJstIso } from './cafe-time';

interface SimulatedTable {
  readonly tableNumber: string;
  readonly classification: TableClassification;
  readonly capacity: number;
  status: TableStatus;
  stateChangedAt: number;
  nextTransitionAt: number;
  statusDurationsMs: Record<TableStatus, number>;
  people: number;
  guestIds: string[];
  seatedAt: number | undefined;
  orderConfirmedAt: number | undefined;
  servedAt: number | undefined;
  activeOrderIds: string[];
  reservations: CafeReservation[];
  billingAmount: number;
  guestsToday: number;
  occupiedMsToday: number;
}

interface TableDefinition {
  readonly classification: TableClassification;
  readonly capacity: number;
}

const SECOND = 1_000;
const HOUR = 60 * 60 * SECOND;

@Injectable({ providedIn: 'root' })
export class CafeSimulationStore {
  private readonly config = inject(CAFE_CONFIG);
  private readonly destroyRef = inject(DestroyRef);
  private readonly openedAt: number;
  private readonly reservedToday: number;
  private readonly tables: SimulatedTable[] = [];
  private readonly guests: CafeGuest[] = [];
  private readonly orders: CafeOrder[] = [];
  private readonly intervalId: ReturnType<typeof setInterval>;
  private nextGuestNumber = 1;
  private nextOrderNumber = 1;
  private lastTickAt: number;

  constructor() {
    if (this.config.seatCount < 1) {
      throw new Error('CAFE_CONFIG.seatCount must be at least 1.');
    }

    if (this.config.hallStaffCount < 1 || this.config.kitchenStaffCount < 1) {
      throw new Error('CAFE_CONFIG staff counts must be at least 1.');
    }

    if (this.config.backendUpdateIntervalMs < 1) {
      throw new Error('CAFE_CONFIG.backendUpdateIntervalMs must be at least 1.');
    }

    if (this.config.sweetsMenu.length === 0) {
      throw new Error('CAFE_CONFIG.sweetsMenu must contain at least 1 item.');
    }

    if (this.config.maxOrderHistoryCount < 1) {
      throw new Error('CAFE_CONFIG.maxOrderHistoryCount must be at least 1.');
    }

    const now = Date.now();
    this.openedAt = now - 4 * HOUR;
    this.reservedToday = this.randomInteger(
      Math.ceil(this.config.seatCount * 0.25),
      Math.ceil(this.config.seatCount * 1.25),
    );
    this.tables.push(...this.createInitialTables(now));
    this.lastTickAt = now;
    this.intervalId = setInterval(
      () => this.advance(Date.now()),
      this.config.backendUpdateIntervalMs,
    );

    // [■観点:自律更新] APIレスポンスの回数とは無関係に、店内状態を一定間隔で進めます。
    this.destroyRef.onDestroy(() => clearInterval(this.intervalId));
  }

  getDashboard(): CafeDashboard {
    const now = Date.now();
    const elapsedBusinessMs = Math.max(1, now - this.openedAt);

    return {
      generatedAt: toJstIso(now),
      staff: {
        hall: this.config.hallStaffCount,
        kitchen: this.config.kitchenStaffCount,
      },
      seats: {
        usedToday: this.tables.reduce((total, table) => total + table.guestsToday, 0),
        reservedToday: this.reservedToday,
        total: this.config.seatCount,
      },
      tables: this.tables.map((table) => this.toSnapshot(table, now, elapsedBusinessMs)),
    };
  }

  updateTable(request: UpdateTableRequest): CafeTable | undefined {
    const table = this.findTable(request.tableNumber);

    if (!table) {
      return undefined;
    }

    const now = Date.now();
    this.advance(now);

    const previousStatus = table.status;
    this.recordCompletedOrderDurations(table, request.status, now);
    table.status = request.status;
    table.stateChangedAt = now;
    table.people = this.resolvePeople(request, table);
    table.billingAmount = this.resolveBillingAmount(request, table);
    table.nextTransitionAt = now + this.durationFor(table.status);

    if (previousStatus === '空き' && table.status !== '空き') {
      table.guestsToday += table.people;
      this.seatGuests(table, now);
    }

    if (previousStatus !== '調理中' && table.status === '調理中' && table.guestIds.length > 0) {
      table.billingAmount = this.createOrders(table, now);
    }

    return this.toSnapshot(table, now, Math.max(1, now - this.openedAt));
  }

  clearTable(tableNumber: string): CafeTable | undefined {
    const table = this.findTable(tableNumber);

    if (!table) {
      return undefined;
    }

    const now = Date.now();
    this.advance(now);
    this.recordCompletedOrderDurations(table, '空き', now);
    this.enterState(table, '空き', now);
    return this.toSnapshot(table, now, Math.max(1, now - this.openedAt));
  }

  addReservation(tableNumber: string, reservation: CafeReservation): CafeTable | undefined {
    const table = this.findTable(tableNumber);

    if (!table) {
      return undefined;
    }

    const now = Date.now();
    this.advance(now);
    table.reservations.push({
      ...reservation,
      予約時間: toJstIso(Date.parse(reservation.予約時間)),
    });
    return this.toSnapshot(table, now, Math.max(1, now - this.openedAt));
  }

  getOrders(): readonly CafeOrder[] {
    return [...this.orders];
  }

  private advance(now: number): void {
    for (const table of this.tables) {
      this.advanceTable(table, now);
    }

    this.lastTickAt = now;
  }

  private advanceTable(table: SimulatedTable, now: number): void {
    let cursor = this.lastTickAt;
    let transitions = 0;

    while (table.nextTransitionAt <= now && transitions < 20) {
      const transitionAt = Math.max(cursor, table.nextTransitionAt);
      this.addElapsedTime(table, transitionAt - cursor);
      this.transition(table, transitionAt);
      cursor = transitionAt;
      transitions += 1;
    }

    this.addElapsedTime(table, Math.max(0, now - cursor));
  }

  private transition(table: SimulatedTable, at: number): void {
    switch (table.status) {
      case '空き': {
        table.people = this.randomInteger(1, table.capacity);
        table.billingAmount = 0;
        table.guestsToday += table.people;
        this.seatGuests(table, at);
        this.enterState(table, '未オーダー', at);
        break;
      }
      case '未オーダー': {
        table.billingAmount = this.createOrders(table, at);
        this.enterState(table, '調理中', at);
        break;
      }
      case '調理中':
        this.recordCookingDuration(table, at);
        table.servedAt = at;
        this.enterState(table, '提供済', at);
        break;
      case '提供済':
        this.recordMealDuration(table, at);
        table.people = 0;
        table.guestIds = [];
        table.seatedAt = undefined;
        table.orderConfirmedAt = undefined;
        table.servedAt = undefined;
        table.activeOrderIds = [];
        this.enterState(table, '片付け中', at);
        break;
      case '片付け中':
        this.enterState(table, '空き', at);
        break;
    }
  }

  private enterState(table: SimulatedTable, status: TableStatus, at: number): void {
    table.status = status;
    table.stateChangedAt = at;

    if (status === '空き') {
      table.people = 0;
      table.guestIds = [];
      table.seatedAt = undefined;
      table.orderConfirmedAt = undefined;
      table.servedAt = undefined;
      table.activeOrderIds = [];
      table.billingAmount = 0;
    }

    table.nextTransitionAt = at + this.durationFor(status);
  }

  private durationFor(status: TableStatus): number {
    switch (status) {
      case '空き':
        return this.randomInteger(2, 12) * SECOND;
      case '未オーダー':
        return this.randomInteger(1, 2) * SECOND;
      case '調理中': {
        const cookingCount = this.tables.filter((table) => table.status === '調理中').length;
        const kitchenLoad = Math.max(1, cookingCount / this.config.kitchenStaffCount);
        return Math.round(this.randomInteger(3, 6) * SECOND * kitchenLoad);
      }
      case '提供済':
        return this.randomInteger(12, 36) * SECOND;
      case '片付け中': {
        const cleanupCount = this.tables.filter((table) => table.status === '片付け中').length;
        const hallLoad = Math.max(1, cleanupCount / this.config.hallStaffCount);
        return Math.round(this.randomInteger(3, 20) * SECOND * hallLoad);
      }
    }
  }

  private createInitialTables(now: number): SimulatedTable[] {
    return Array.from({ length: this.config.seatCount }, (_, index) => {
      const definition = this.tableDefinition(index);
      const status = this.randomInitialStatus();
      const people =
        status === '空き' || status === '片付け中' ? 0 : this.randomInteger(1, definition.capacity);
      const stateAge = this.initialStateAge(status);
      const businessElapsed = now - this.openedAt;
      const historicalUsageRatio = this.randomInteger(25, 85) / 100;

      const table: SimulatedTable = {
        tableNumber: `T${String(index + 1).padStart(2, '0')}`,
        classification: definition.classification,
        capacity: definition.capacity,
        status,
        stateChangedAt: now - stateAge,
        nextTransitionAt: now,
        statusDurationsMs: this.createStatusDurations(status, stateAge),
        people,
        guestIds: [],
        seatedAt: undefined,
        orderConfirmedAt: undefined,
        servedAt: undefined,
        activeOrderIds: [],
        reservations: [],
        billingAmount: 0,
        guestsToday: this.randomInteger(0, 5) * definition.capacity + people,
        occupiedMsToday: Math.round(businessElapsed * historicalUsageRatio),
      };

      const initialOrderConfirmedAt = this.initialOrderConfirmedAt(table);

      if (people > 0) {
        const seatedAt = initialOrderConfirmedAt
          ? initialOrderConfirmedAt - this.randomInteger(1, 2) * SECOND
          : table.stateChangedAt;
        this.seatGuests(table, seatedAt);
      }

      if (initialOrderConfirmedAt) {
        table.billingAmount = this.createOrders(table, initialOrderConfirmedAt);

        if (status === '提供済') {
          this.recordCookingDuration(table, table.stateChangedAt);
          table.servedAt = table.stateChangedAt;
        }
      }

      table.nextTransitionAt = table.stateChangedAt + this.durationFor(status);
      return table;
    });
  }

  private initialOrderConfirmedAt(table: SimulatedTable): number | undefined {
    switch (table.status) {
      case '調理中':
        return table.stateChangedAt;
      case '提供済':
        return table.stateChangedAt - this.randomInteger(3, 6) * SECOND;
      default:
        return undefined;
    }
  }

  private toSnapshot(table: SimulatedTable, now: number, elapsedBusinessMs: number): CafeTable {
    return {
      tableNumber: table.tableNumber,
      classification: table.classification,
      status: table.status,
      guestIds: [...table.guestIds],
      予約: table.reservations.map((reservation) => ({ ...reservation })),
      stateElapsedSeconds: Math.max(0, Math.floor((now - table.stateChangedAt) / SECOND)),
      statusDurationsSeconds: this.toStatusDurationsSeconds(table, now),
      people: table.people,
      billingAmount: table.billingAmount,
      dailyUsageRate:
        Math.round(Math.min(100, (table.occupiedMsToday / elapsedBusinessMs) * 1000)) / 10,
    };
  }

  private addElapsedTime(table: SimulatedTable, elapsedMs: number): void {
    table.statusDurationsMs[table.status] += elapsedMs;

    if (table.status !== '空き') {
      table.occupiedMsToday += elapsedMs;
    }
  }

  private createStatusDurations(status: TableStatus, initialElapsedMs: number): Record<TableStatus, number> {
    return {
      空き: status === '空き' ? initialElapsedMs : 0,
      未オーダー: status === '未オーダー' ? initialElapsedMs : 0,
      調理中: status === '調理中' ? initialElapsedMs : 0,
      提供済: status === '提供済' ? initialElapsedMs : 0,
      片付け中: status === '片付け中' ? initialElapsedMs : 0,
    };
  }

  private toStatusDurationsSeconds(table: SimulatedTable, now: number): Record<TableStatus, number> {
    const durationsMs = { ...table.statusDurationsMs };
    durationsMs[table.status] += Math.max(0, now - this.lastTickAt);

    return {
      空き: Math.floor(durationsMs.空き / SECOND),
      未オーダー: Math.floor(durationsMs.未オーダー / SECOND),
      調理中: Math.floor(durationsMs.調理中 / SECOND),
      提供済: Math.floor(durationsMs.提供済 / SECOND),
      片付け中: Math.floor(durationsMs.片付け中 / SECOND),
    };
  }

  private resolvePeople(request: UpdateTableRequest, table: SimulatedTable): number {
    if (request.status === '空き' || request.status === '片付け中') {
      return 0;
    }

    return Math.min(table.capacity, Math.max(1, request.people ?? table.people ?? 1));
  }

  private resolveBillingAmount(request: UpdateTableRequest, table: SimulatedTable): number {
    if (request.status === '空き' || request.status === '未オーダー') {
      return 0;
    }

    return Math.max(
      0,
      request.billingAmount ?? table.billingAmount,
    );
  }

  private seatGuests(table: SimulatedTable, seatedAt: number): void {
    table.seatedAt = seatedAt;
    table.guestIds = Array.from({ length: table.people }, () => {
      const id = `G${String(this.nextGuestNumber++).padStart(4, '0')}`;
      this.guests.push({
        id,
        tableNumber: table.tableNumber,
        seatedAt: toJstIso(seatedAt),
      });
      return id;
    });
  }

  private createOrders(table: SimulatedTable, orderedAt: number): number {
    // [■観点:注文数] 来客数とは独立して、1件から「来客数 + 1件」までの注文を作成します。
    const orderCount = this.randomInteger(1, table.people + 1);
    let billingAmount = 0;
    const orderMs = Math.max(0, orderedAt - (table.seatedAt ?? orderedAt));

    for (let index = 0; index < orderCount; index += 1) {
      const menuItem = this.config.sweetsMenu[this.randomInteger(0, this.config.sweetsMenu.length - 1)];

      const id = `O${String(this.nextOrderNumber++).padStart(4, '0')}`;
      this.orders.push({
        id,
        // 注文は個人ではなく、その時点で同じテーブルにいる来客全員に紐付けます。
        guestIds: [...table.guestIds],
        tableNumber: table.tableNumber,
        durations: {
          staySeconds: Math.max(0, Math.floor(orderMs / SECOND)),
          orderMs,
        },
        menuName: menuItem.name,
        priceYen: menuItem.priceYen,
        orderedAt: toJstIso(orderedAt),
      });
      table.activeOrderIds.push(id);
      this.removeExpiredOrders();
      billingAmount += menuItem.priceYen;
    }

    table.orderConfirmedAt = orderedAt;
    return billingAmount;
  }

  private recordCookingDuration(table: SimulatedTable, servedAt: number): void {
    const cookingMs = Math.max(0, servedAt - (table.orderConfirmedAt ?? servedAt));
    this.updateActiveOrders(table, { cookingMs });
  }

  private recordMealDuration(table: SimulatedTable, leftAt: number): void {
    const mealMs = Math.max(0, leftAt - (table.servedAt ?? leftAt));
    this.updateActiveOrders(table, { mealMs });
  }

  private recordCompletedOrderDurations(
    table: SimulatedTable,
    nextStatus: TableStatus,
    at: number,
  ): void {
    if (table.status === '調理中' && nextStatus !== '調理中') {
      this.recordCookingDuration(table, at);
      table.servedAt = at;
    }

    if (table.status === '提供済' && nextStatus !== '提供済') {
      this.recordMealDuration(table, at);
    }
  }

  private updateActiveOrders(
    table: SimulatedTable,
    durations: Pick<CafeOrder['durations'], 'cookingMs' | 'mealMs'>,
  ): void {
    for (const id of table.activeOrderIds) {
      const orderIndex = this.orders.findIndex((order) => order.id === id);

      if (orderIndex >= 0) {
        this.orders[orderIndex] = {
          ...this.orders[orderIndex],
          durations: { ...this.orders[orderIndex].durations, ...durations },
        };
      }
    }
  }

  private removeExpiredOrders(): void {
    const excessOrderCount = this.orders.length - this.config.maxOrderHistoryCount;

    if (excessOrderCount > 0) {
      this.orders.splice(0, excessOrderCount);
    }
  }

  private initialStateAge(status: TableStatus): number {
    switch (status) {
      case '空き':
        return this.randomInteger(0, 8) * SECOND;
      case '未オーダー':
        return this.randomInteger(0, 1) * SECOND;
      case '調理中':
        return this.randomInteger(0, 4) * SECOND;
      case '提供済':
        return this.randomInteger(0, 20) * SECOND;
      case '片付け中':
        return this.randomInteger(0, 10) * SECOND;
    }
  }

  private randomInitialStatus(): TableStatus {
    const value = Math.random();

    if (value < 0.3) return '空き';
    if (value < 0.4) return '未オーダー';
    if (value < 0.55) return '調理中';
    if (value < 0.9) return '提供済';
    return '片付け中';
  }

  private tableDefinition(index: number): TableDefinition {
    const definitions: readonly TableDefinition[] = [
      { classification: 'カウンター', capacity: 1 },
      { classification: 'テーブル', capacity: 2 },
      { classification: 'テーブル', capacity: 4 },
      { classification: 'テラス', capacity: 4 },
    ];

    return definitions[index % definitions.length];
  }

  private findTable(tableNumber: string): SimulatedTable | undefined {
    return this.tables.find((table) => table.tableNumber === tableNumber);
  }

  private randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
