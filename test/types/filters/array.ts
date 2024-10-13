import { Filter } from "mongodb";
import { FilterOfTSchema } from "../../../src/index.js";

type T = {
  a: { c: number, d: string }[],
  b: string[],
};

const f: FilterOfTSchema<T> = {
  $and: [
    { b: { $all: ["test", "test1"] } },
    { a: { $all: [{ c: 1, d: "test" }] } }
  ]
};
const f2: Filter<T> = f;

console.log(f, f2);

