import { createSelector } from "@ngrx/store";
import { usersFeature } from "./users.reducer";

const selectUsers = usersFeature.selectUsers;
const selectIsLoading = createSelector(usersFeature.selectIsLoading, (isLoading) => isLoading);

export const UsersSelectors = {
  selectUsers,
  selectIsLoading,
};
