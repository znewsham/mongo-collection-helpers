# mongo-helpers

A package that provides some test and production helpers

## Production
`unionOfProjections` - takes an array of projections and combines them into a single projection, handling nested and flat projections (but not a mix) as well as array operators.

```javascript
unionOfProjections([
  { a: 1},
  { a:
    { b: 1}
  }
]) // { a: 1 }


unionOfProjections([
  { a: 1},
  { a: { $elemMatch: 1} }
]) // { a: 1 }

unionOfProjections([
  { a: 1},
  { b: 1 }
]) // { a: 1, b: 1 }

unionOfProjections([
  { a: 1 },
  { b: 0 }
]) // { b: 0 }
```

We also expose the type `NestedProjectionOfTSchema` which allows the defininition of a projection for a complex mongo schema - including array operations.

## Test helpers
We expose `FakeCollection` and `FakeFindCursor`. These are very lightweight partial implementations of the mongo API in memory, not suitable for production but generally acceptable for testing.

These have peer dependencies:
- `@blastjs/minimongo`
