import { ProjectionOfTSchema } from "../../../src/index.js";

type T = {
  a: { b: number, c: string }[],
};

const f: ProjectionOfTSchema<T> = {
  "a.$.b": 1
};
console.log(f);

