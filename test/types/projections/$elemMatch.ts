import { ProjectionOfTSchema } from "../../../src/index.js";

type T = {
  a: { b: number, c: string }[],
};

export const f: ProjectionOfTSchema<T> = {
  a: {
    $elemMatch: {
      b: 1
    }
  }
};
export const f2: ProjectionOfTSchema<T> = {
  a: {
    $elemMatch: {
      $and: [{ b: 1 }]
    }
  }
};

