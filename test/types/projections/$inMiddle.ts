import { NestedProjectionOfTSchema } from "../../../src/index.js";

type T = {
  a: { b: number, c: string }[],
};

const f: NestedProjectionOfTSchema<T> = {
  "a.$.b": 1
};
console.log(f);

