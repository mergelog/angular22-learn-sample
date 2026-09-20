import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, delay } from "rxjs";
import { User } from "./user.model";

@Injectable()
export class UsersApi {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>("/api/users.json").pipe(delay(1000));
  }
}
