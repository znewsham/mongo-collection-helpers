import { Filter } from "mongodb";
import { RootFilterOfTSchema } from "../../../src/index.js";

type T = {
  a: string,
  b: string[],
};

const f: RootFilterOfTSchema<T> = {
  $and: [
    { a: /hello/i },
    { a: "hello" },
    { a: { $regex: "a" } },
    { a: { $regex: "a", $options: "i" } },
    { "b.0": "hello" },
    { b: "hello" },
    { b: ["hello"] },
    { "b.0": /hello/i },
    { b: /hello/i },
    { "b.0": { $regex: "a" } },
    { b: { $regex: "a" } },
    { "b.0": { $regex: "a", $options: "i" } },
    { b: { $regex: "a", $options: "i" } }
  ]
};
const f2: Filter<T> = f;

console.log(f, f2);

