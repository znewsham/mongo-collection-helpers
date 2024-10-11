import { NestedProjectionOfTSchema } from "../../../src/index.js";

type T = {
  a: { b: number, c: string },
};

const f: NestedProjectionOfTSchema<T> = {
  _id: 0
};

console.log(f);

