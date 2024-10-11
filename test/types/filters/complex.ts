import { Filter } from "mongodb";
import { RootFilterOfTSchema } from "../../../src/index.js";

type T = {
  a1: string[],
  b1: number[],
  a: { b: number, c: string },
  d: { e: string, f: number, g: { h: number, i: string, j: { a: number } }[] }
};

const f: RootFilterOfTSchema<T> = {
  a1: {
    $ne: "test"
  },
  d: {
    e: "test",
    f: 2,
    g: [{ h: 1, i: "", j: { a: 1 } }]
  },
  "d.g.i": "test",
  "d.g.h": 3,
  "d.g.0.h": 3,
  "d.g": {
    $size: 3,
    $elemMatch: {
      $and: [
        {
          "j.a": 1
        },
        {
          h: 1
        }
      ]
    }
  }
};

const f2: Filter<T> = f;

console.log(f, f2);

