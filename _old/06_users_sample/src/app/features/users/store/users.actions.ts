import { createAction, props } from "@ngrx/store";
import { User } from "../data-access/user.model";

export const loadUsers = createAction("[Users] Load");

export const clearUsers = createAction("[Users] Clear");

export const loadUsersSuccess = createAction(
  "[Users] Load Success",
  props<{ users: User[] }>(),
);
