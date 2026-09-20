import { Component, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { clearUsers, loadUsers } from "./features/users/store/users.actions";
import { UsersSelectors } from "./features/users/store/users.selectors";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  private readonly store = inject(Store);

  protected readonly users = this.store.selectSignal(UsersSelectors.selectUsers);
  protected readonly isLoading = this.store.selectSignal(UsersSelectors.selectIsLoading);

  protected loadUsers(): void {
    this.store.dispatch(loadUsers());
  }

  protected clearUsers(): void {
    this.store.dispatch(clearUsers());
  }
}
