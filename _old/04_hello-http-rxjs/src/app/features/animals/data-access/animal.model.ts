export type AccountId = string;

export type AnimalKind = "dog" | "cat" | "unknown";

export interface Animal {
  accountId: AccountId;
  name: string;
  kind: AnimalKind;
  age: number;
  /** 単位は kg。 */
  weight: number;
}
