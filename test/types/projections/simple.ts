import { NestedProjectionOfTSchema } from "../../../src/index.js";

type T = {
  a: { b: number, c: string },
};

const f: NestedProjectionOfTSchema<T> = {
  "a.b": 1,
  "a.c": 0,
  a: {
    b: 1,
    c: 0
  }
};

console.log(f);

