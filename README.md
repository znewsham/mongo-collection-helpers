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

We also expose the types
-  `NestedProjectionOfTSchema` which allows the defininition of a projection for a complex mongo schema - including array operations.
- `WithCursorDescription` - indicating a cursor exposes a valid `cursorDescription`
- `CursorDescription` - which defines a filter + options (skip, limit, projection, sort)

## Test helpers
We expose `FakeCollection` and `FakeFindCursor`. These are very lightweight partial implementations of the mongo API in memory, not suitable for production but generally acceptable for testing.

These have peer dependencies:
- `@blastjs/minimongo`


## Types

exposes `ProjectionOfTSchema` and `FilterOfTSchema` which provide strict typechecking on the projection and filter of a schema. Can be used as follows:

```typescript
  type TSchema = { a: { b: number, c: string }, d: { e: number, f: string }[]}
  const filter: FilterOfTSchema<TSchema> = {
    "a.b": { $gt: 1 },
    "a.c": /whatever/
    "d.e": { $lt: 1 },
    "d.f": /whatever/,
    "d.0.f": /whatever/,
    d: { $elemMatch: { e: { $gt: 1 } }}
  }
```
The `filter` item will be strictly checked such that you don't make common mistakes like:
```typescript
  const filter: FilterOfTSchema<TSchema> = {
    a: {
      b: 1
    }// invalid because it's looking for an element of `a` which is literally b: 1 vs any `a` with b: 1, or a complete and valid `a`
  }
```

Simiarly, the `ProjectionOfTSchema` can be used as follows:

```typescript
  const projection: ProjectionOfTSchema<TSchema> = {
    a: {
      b: 1
    },
    "a.c": 1,
    d: { $slice: -1 },
  }
```
