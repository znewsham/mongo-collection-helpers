import { RootFilterOfTSchema } from "../../../src/index.js";

type T = {
  a: string,
  b: string[],
};

const f: RootFilterOfTSchema<T> = {
  $and: [
    { a: /hello/i },
    { a: { $regex: "a" } },
    { a: { $regex: "a", $options: "i" } },
    { "b.0": /hello/i },
    { b: /hello/i },
    { "b.0": { $regex: "a" } },
    { b: { $regex: "a" } },
    { "b.0": { $regex: "a", $options: "i" } },
    { b: { $regex: "a", $options: "i" } }
  ]
};

console.log(f);

