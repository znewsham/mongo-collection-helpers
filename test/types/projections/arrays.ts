import { NestedProjectionOfTSchema } from "../../../src/index.js";

type T = {
  a: { b: number, c: string }[],
};

const f: NestedProjectionOfTSchema<T> = {
  "a.b": 1,
  "a.$": 1
};
const f2: NestedProjectionOfTSchema<T> = {
  "a.b": 1,
  "a.$": 1,
  a: { $slice: -1 }
};

console.log(f, f2);

