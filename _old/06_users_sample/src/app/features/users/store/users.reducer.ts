import { createFeature, createReducer, on } from "@ngrx/store";
import { User } from "../data-access/user.model";
import { clearUsers, loadUsers, loadUsersSuccess } from "./users.actions";

export interface UsersState {
  users: User[];
  isLoading: boolean;
}

const initialState: UsersState = {
  users: [],
  isLoading: false,
};

export const usersFeature = createFeature({
  name: "users",
  reducer: createReducer(
    initialState,
    on(loadUsers, (state): UsersState => ({ ...state, isLoading: true })),
    on(clearUsers, (state): UsersState => ({ ...state, users: [] })),
    on(loadUsersSuccess, (state, { users }): UsersState => ({
      ...state,
      users,
      isLoading: false,
    })),
  ),
});
