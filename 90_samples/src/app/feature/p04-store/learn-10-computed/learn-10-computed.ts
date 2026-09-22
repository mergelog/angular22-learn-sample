import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';

type Experiment = { id: number; name: string; status: 'running' | 'completed' };
type TableMode = 'table' | 'compare';

@Component({
  selector: 'app-learn-10-computed',
  imports: [P04StoreNavi],
  templateUrl: './learn-10-computed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn10Computed {
  readonly archived = signal(false);
  readonly archiveLabel = computed(() => this.archived() ? 'アーカイブ済み' : '通常表示');

  readonly queues = signal(['default', 'gpu-fast', 'gpu-large', 'cpu-batch']);
  readonly queueQuery = signal('');
  readonly filteredQueues = computed(() => {
    const query = this.queueQuery().trim().toLowerCase();
    return this.queues().filter((queue) => queue.toLowerCase().includes(query));
  });

  readonly experiments = signal<Experiment[]>([
    { id: 1, name: '画像分類', status: 'running' },
    { id: 2, name: '異常検知', status: 'completed' },
  ]);
  readonly selectedId = signal<number | null>(1);
  readonly tableMode = signal<TableMode>('table');
  readonly selectedExperiment = computed(() =>
    this.experiments().find((experiment) => experiment.id === this.selectedId()) ?? null,
  );
  readonly highlightedExperiment = computed(() =>
    this.tableMode() === 'compare' ? null : this.selectedExperiment(),
  );

  toggleArchived(): void {
    this.archived.update((value) => !value);
  }

  searchQueues(query: string): void {
    this.queueQuery.set(query);
  }

  selectExperiment(id: number): void {
    this.selectedId.set(id);
  }

  toggleMode(): void {
    this.tableMode.update((mode) => mode === 'table' ? 'compare' : 'table');
  }
}
