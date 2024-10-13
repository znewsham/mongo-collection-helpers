import { ProjectionOfTSchema } from "../../../src/index.js";

type T = {
  a: { b: number, c: string }[],
};

const f: ProjectionOfTSchema<T> = {
  a: {
    $elemMatch: {
      c: 1
    }
  }
};
const f2: ProjectionOfTSchema<T> = {
  a: {
    $elemMatch: {
      $and: [{ d: 1 }]
    }
  }
};

console.log(f, f2);
