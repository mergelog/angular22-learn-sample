import { inject, runInInjectionContext, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { defer, finalize, map, Observable, tap, timer } from 'rxjs';
import { createTerminalInjector } from '../../injector';

type User = { id: number; name: string };

class UserService {
  getUser(userId: number): Observable<User> {
    return defer(() => {
      console.log(`[subscribe] userId=${userId}`);

      return timer(80).pipe(
        tap(() => console.log(`[response] userId=${userId}`)),
        map(() => ({ id: userId, name: `User ${userId}` })),
        finalize(() => console.log(`[unsubscribe] userId=${userId}`)),
      );
    });
  }
}

export class UserComponent {
  private readonly userService = inject(UserService);

  readonly userId = signal(1);

  readonly userResource = rxResource({
    params: () => this.userId(),
    stream: ({ params: userId }) => this.userService.getUser(userId),
  });
}

export function runRxResourceParamsExample(): void {
  console.log('--- rxResource の params 変更例');

  const injector = createTerminalInjector([UserService]);
  const component = runInInjectionContext(injector, () => new UserComponent());

  console.log('初期条件:', component.userId());

  setTimeout(() => {
    component.userId.set(2);
    console.log('検索条件を変更:', component.userId());
  }, 20);

  setTimeout(() => {
    console.log('status:', component.userResource.status());
    console.log('value:', component.userResource.value());
    injector.destroy();
  }, 200);
}
