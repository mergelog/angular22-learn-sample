import { AnimalDto } from "./animal.dto";
import { Animal, AnimalKind } from "./animal.model";

const KNOWN_KINDS: readonly AnimalKind[] = ["dog", "cat"];

/**
 * API が想定外の値を返しても画面が壊れないよう、ここで union に絞り込む。
 * 未知の値は捨てずに "unknown" として残し、件数のズレを起こさない。
 */
function toAnimalKind(kind: string): AnimalKind {
  return KNOWN_KINDS.includes(kind as AnimalKind) ? (kind as AnimalKind) : "unknown";
}

export function toAnimal(dto: AnimalDto): Animal {
  return {
    accountId: dto.accountId,
    name: dto.name,
    kind: toAnimalKind(dto.kind),
    age: dto.age,
    weight: dto.weight,
  };
}
