import { ProjectionOfTSchema } from "../../../src/index.js";

type T = {
  a: { b: number, c: string }[],
};

const f: ProjectionOfTSchema<T> = {
  "a.b": 1,
  "a.$": 1
};
const f2: ProjectionOfTSchema<T> = {
  "a.b": 1,
  "a.$": 1,
  a: { $slice: -1 }
};

console.log(f, f2);

