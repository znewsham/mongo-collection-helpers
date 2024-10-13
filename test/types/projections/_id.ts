import { ProjectionOfTSchema } from "../../../src/index.js";

type T = {
  a: { b: number, c: string },
};

const f: ProjectionOfTSchema<T> = {
  _id: 0
};

console.log(f);

