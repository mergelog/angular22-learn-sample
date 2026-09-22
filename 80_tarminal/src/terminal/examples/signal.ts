import { computed, signal } from '@angular/core';

export function runSignalExample(): void {
  const count = signal(1);
  const doubled = computed(() => count() * 2);

  console.log('Signal before:', doubled());
  count.set(3);
  console.log('Signal after: ', doubled());
}
