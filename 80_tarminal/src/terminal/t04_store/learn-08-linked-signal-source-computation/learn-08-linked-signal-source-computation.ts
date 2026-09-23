import { linkedSignal, signal } from '@angular/core';

type Queue = { id: number; name: string };

export function runLinkedSignalSourceComputationExample(): void {
  console.log('--- linkedSignal の source / computation の例');

  const queues = signal<Queue[]>([
    { id: 1, name: 'default' },
    { id: 2, name: 'gpu-fast' },
  ]);

  const selectedQueue = linkedSignal<Queue[], Queue | null>({
    source: queues,
    computation: (currentQueues, previous) => {
      console.log('source:', currentQueues);
      console.log('previous:', previous);

      return currentQueues.find((queue) => queue.id === previous?.value?.id)
        ?? currentQueues[0]
        ?? null;
    },
  });

  console.log('初期選択:', selectedQueue());
  console.log('↓↓↓↓↓')

  selectedQueue.set(queues()[1]);
  console.log('手動で選択:', selectedQueue());
  console.log('↓↓↓↓↓')

  queues.set([
    { id: 2, name: 'gpu-fast（更新後）' },
    { id: 3, name: 'cpu-batch' },
  ]);
  console.log('同じ id を維持:', selectedQueue());
  console.log('↓↓↓↓↓')

  queues.set([
    { id: 3, name: 'cpu-batch' },
    { id: 4, name: 'gpu-large' },
  ]);
  console.log('選択肢が消えたら先頭:', selectedQueue());
  console.log('↓↓↓↓↓')
}
