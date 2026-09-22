import { computed, signal } from '@angular/core';

type Experiment = { id: number; name: string; status: 'running' | 'completed' };
type TableMode = 'table' | 'compare';

export function runComputedExample(): void {
  console.log('--- 低：1つの状態から表示文言を作る');
  const archived = signal(false);
  const archiveLabel = computed(() => archived() ? 'アーカイブ済み' : '通常表示');
  console.log('変更前:', archiveLabel());
  archived.set(true);
  console.log('変更後:', archiveLabel());

  console.log('--- 中：入力に応じて一覧を絞り込む');
  const queues = signal(['default', 'gpu-fast', 'gpu-large', 'cpu-batch']);
  const queueQuery = signal('');
  const filteredQueues = computed(() => {
    const query = queueQuery().trim().toLowerCase();
    return queues().filter((queue) => queue.toLowerCase().includes(query));
  });
  console.log('検索前:', filteredQueues());
  queueQuery.set('GPU');
  console.log('GPU で検索:', filteredQueues());

  console.log('--- 高：選択対象と表示モードからハイライトを決める');
  const experiments = signal<Experiment[]>([
    { id: 1, name: '画像分類', status: 'running' },
    { id: 2, name: '異常検知', status: 'completed' },
  ]);
  const selectedId = signal<number | null>(1);
  const tableMode = signal<TableMode>('table');
  const selectedExperiment = computed(() =>
    experiments().find((experiment) => experiment.id === selectedId()) ?? null,
  );
  const highlightedExperiment = computed(() =>
    tableMode() === 'compare' ? null : selectedExperiment(),
  );
  console.log('通常モード:', highlightedExperiment()?.name ?? 'なし');
  tableMode.set('compare');
  console.log('比較モード:', highlightedExperiment()?.name ?? 'なし');
  selectedId.set(2);
  console.log('比較中の選択:', selectedExperiment()?.name ?? 'なし');
  console.log('比較中のハイライト:', highlightedExperiment()?.name ?? 'なし');
  tableMode.set('table');
  console.log('通常モードに戻す:', highlightedExperiment()?.name ?? 'なし');
}
