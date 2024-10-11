import { RootFilterOfTSchema } from "../../../src/index.js";

type T = {
  a: { c: number, d: string }[],
  b: string[],
};

const f: RootFilterOfTSchema<T> = {
  $and: [
    { b: { $all: ["test", "test1"] } },
    { a: { $all: [{ c: 1, d: "test" }] } }
  ]
};

console.log(f);

