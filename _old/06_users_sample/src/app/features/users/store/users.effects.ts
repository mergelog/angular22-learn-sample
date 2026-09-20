import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, switchMap } from "rxjs";
import { UsersApi } from "../data-access/users.api";
import { loadUsers, loadUsersSuccess } from "./users.actions";

const loadUsers$ = createEffect(
  (actions$ = inject(Actions), usersApi = inject(UsersApi)) =>
    actions$.pipe(
      ofType(loadUsers),
      switchMap(() => usersApi.getUsers()),
      map((users) => loadUsersSuccess({ users })),
    ),
  { functional: true },
);

export const usersEffects = { loadUsers$ };
