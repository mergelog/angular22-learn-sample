import { Injectable, signal } from '@angular/core';

@Injectable()
export class WorkspaceActivityService {
  private readonly activityState = signal<readonly string[]>(['スコープを作成しました']);

  readonly activities = this.activityState.asReadonly();

  add(message: string): void {
    this.activityState.update((activities) => [...activities, message]);
  }
}
