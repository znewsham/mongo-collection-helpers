import { NestedProjectionOfTSchema } from "../../../src/index.js";

type T = {
  a: { b: number, c: string }[],
};

const f: NestedProjectionOfTSchema<T> = {
  a: {
    $elemMatch: {
      b: 1
    }
  }
};
const f2: NestedProjectionOfTSchema<T> = {
  a: {
    $elemMatch: {
      $and: [{ b: 1 }]
    }
  }
};

console.log(f, f2);

