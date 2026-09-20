import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { AnimalsResponseDto } from "./animal.dto";
import { toAnimal } from "./animal.mapper";
import { Animal } from "./animal.model";

/**
 * この feature で HttpClient を触る唯一の場所。
 * 呼び出し側には DTO を漏らさず、常にドメイン型の Observable を返す。
 */
@Injectable()
export class AnimalsApi {
  private readonly http = inject(HttpClient);

  loadAnimals(): Observable<Animal[]> {
    return this.http
      .get<AnimalsResponseDto>("/animals.json")
      .pipe(map((response) => response.animals.map(toAnimal)));
  }
}
