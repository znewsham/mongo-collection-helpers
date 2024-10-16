/**
 *
 *
 *
 *
 *
 * There were only two locations in this file using syntax unavailable in es2015 (around the latest node12 supports)
 * So I just removed those instead of transpiling down
 *
 *
 *
 *
 */

import type { BSONRegExp, Document, Filter, FilterOperators, WithId } from "mongodb";


type AllPossibleValuesOfProjection<TSchema extends object = object> =
  ProjectionOfTSchema<TSchema>
  | { $elemMatch?: Document, $slice?: number }
  | 1 | 0 | true | false

type RecursiveKeyOf<TObj extends object, useDollar extends boolean> = {
  [TKey in keyof TObj & (string)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, useDollar>;
}[keyof TObj & (string)];

type RecursiveKeyOfInner<TObj extends object, useDollar extends boolean> = {
  [TKey in keyof TObj & (string)]: RecursiveKeyOfHandleValue<TObj[TKey], `.${TKey}`, useDollar>;
}[keyof TObj & (string)];

type RecursiveKeyOfHandleValue<TValue, Text extends string, useDollar extends boolean> =
  TValue extends object[]
    ? Text | (useDollar extends true
      ? `${Text}${RecursiveKeyOfInner<TValue[0], useDollar>}` | `${Text}.$`
      : `${Text}${RecursiveKeyOfInner<TValue[0], useDollar>}` | `${Text}.${number}${RecursiveKeyOfInner<TValue[0], useDollar>}`) | `${Text}.${number}`
    : TValue extends any[]
      ? Text | `${Text}.${useDollar extends true ? '$' : `${number}`}`
      : TValue extends object
        ? Text | `${Text}${RecursiveKeyOfInner<TValue, useDollar>}`
        : Text
;


type TypeForDottedKey<TObj extends object, TKey extends string> = TKey extends `${infer prefix}.${infer suffix}`
  ? prefix extends keyof TObj
    ? TObj[prefix] extends {[k in suffix]: any }
      ? suffix extends `${number}`
        ? TObj[prefix] extends any[]
          ? TObj[prefix][0]
          : TObj[prefix][suffix]
        : TypeForDottedKey<TObj[prefix], suffix>
      : TObj[prefix] extends object[]
        ? suffix extends `${number}`
          ? TObj[prefix][0]
          : TypeForDottedKey<TObj[prefix], suffix>
        : TObj[prefix] extends object
          ? TypeForDottedKey<TObj[prefix], suffix>
          : 1
    : TObj extends any[]
      ? TypeForDottedKey<TObj[0], suffix>
      : { prefix: prefix, suffix: suffix, TObj: TObj }
  : TKey extends keyof TObj
    ? TObj[TKey]
    : TObj extends any[]
      ? TKey extends `${number}`
        ? TObj[0]
        : TypeForDottedKey<TObj[0], TKey>
      : never

// eh. Need to look at this.
type AggregationProjectionDocument<TObj extends any> = never;

type ProjectionElemMatch<T extends any[], Depth extends DepthType> = Depth extends never
  ? Document
  : (NestedFilterOfTSchema<T[0], NextDepth<Depth>> | RootFilterOperators<T[0], NextDepth<Depth>>);


type NestedProjectionOfTSchemaWithId<TObj extends object, Depth extends DepthType> = {
  [k in (keyof TObj | RecursiveKeyOf<TObj, true>) & string]?: k extends keyof TObj
    ? TObj[k] extends object[]
      ? 1 | 0 | NestedProjectionOfTSchemaWithId<TObj[k][0], NextDepth<Depth>> | { $elemMatch?: ProjectionElemMatch<TObj[k], Depth>, $slice?: number }
      : TObj[k] extends object
        ? 1 | 0 | NestedProjectionOfTSchemaWithId<TObj[k], NextDepth<Depth>>
        : 1 | 0
    : TypeForDottedKey<TObj, k> extends object[]
      ? 1 | 0 | NestedProjectionOfTSchemaWithId<TypeForDottedKey<TObj, k>[0], NextDepth<Depth>>
      : TypeForDottedKey<TObj, k> extends object
        ? 1 | 0 | NestedProjectionOfTSchemaWithId<TypeForDottedKey<TObj, k>, NextDepth<Depth>>
        : 1 | 0
}


/** @deprecated use ProjectionOfTSchema */
export type NestedProjectionOfTSchema<TObj extends object> = NestedProjectionOfTSchemaWithId<WithId<TObj>, DepthDefault>
export type ProjectionOfTSchema<TObj extends object> = NestedProjectionOfTSchemaWithId<WithId<TObj>, DepthDefault>;

type AlwaysOperators<T, Depth extends DepthType> = Partial<Pick<FilterOperators<T>, "$exists" | "$type" | "$expr">>
  | { $not?: RegExp | FilterOperatorsByType<T, Depth> }

type EqualityOperators<T> = Partial<Pick<FilterOperators<T>, "$eq" | "$ne" | "$exists">>
  | (T extends any[]
    ? Partial<Pick<FilterOperators<T[0]>, "$in" | "$nin">>
    : Partial<Pick<FilterOperators<T>, "$in" | "$nin">>);

type BinaryOperator<T> = EqualityOperators<T> | Partial<Pick<
  FilterOperators<T>,
  "$bitsAllClear" | "$bitsAllSet" | "$bitsAnyClear" | "$bitsAnySet"
>>

type NumericOperators<T> = EqualityOperators<T> | Partial<Pick<
  FilterOperators<T>,
  "$lt" | "$gt" | "$lte" | "$gte" | "$mod"
>>

type StringOperators<T> = RegExp | BSONRegExp | EqualityOperators<T> | Partial<Pick<
  FilterOperators<T>,
  "$regex" | "$options"
>>

type ArrayOperators<T extends ReadonlyArray<any>, Depth extends DepthType> = EqualityOperators<T>
  | {
    $all?: T,
    $size?: number
    $elemMatch?: NestedFilterOfTSchema<T[0], Depth> | RootFilterOperators<T[0], Depth>
  }

type BinaryLike = Uint8Array | { buffer: Uint8Array };

/**
 * @remarks we pick 8 because mongodb did (NestedPaths) and use an array for the same reason - didn't even know you could do this in TS.
 * @remarks actually - doesn't look like it works (get `Type instantiation is excessively deep and possibly infinite.` with this but not the number based depth)
 */
// type NextDepth<Depth extends DepthType> = Depth["length"] extends 4
//   ? never
//   : [...Depth, 1];

type NextDepth<Depth extends number> = Depth extends 0
  ? 1
  : Depth extends 1
    ? 2
    : Depth extends 2
      ? 3
      : Depth extends 3
        ? 4
        : never;

type DepthType = number;
type DepthDefault = 0;
type FilterOperatorsByType<T, Depth extends DepthType> = Depth extends never
  ? never
  : T extends any[]
    ? FilterOperatorsByType<T[0], NextDepth<Depth>> | ArrayOperators<T, NextDepth<Depth>>
    : T extends string
      ? AlwaysOperators<T, NextDepth<Depth>> | StringOperators<T>
      : T extends number
        ? AlwaysOperators<T, NextDepth<Depth>> | NumericOperators<T> | BinaryOperator<T>
        : T extends object
          ? T
          : T extends BinaryLike
            ? AlwaysOperators<T, NextDepth<Depth>> | BinaryOperator<T>
            : never


type NestedFilterOfTSchemaValue<TObj extends object, k, Depth extends DepthType> = Depth extends never
  ? Document
  : k extends keyof TObj
    ? TObj[k] extends object[]
      ? FilterOperatorsByType<TObj[k], Depth> | TObj[k]
      : TObj[k] extends any[]
        ? FilterOperatorsByType<TObj[k], Depth> | TObj[k][0] | TObj[k]
        : FilterOperatorsByType<TObj[k], Depth> | TObj[k]
    : k extends string
      ? TypeForDottedKey<TObj, k> extends object[]
        ? FilterOperatorsByType<TypeForDottedKey<TObj, k>, Depth>
        : TypeForDottedKey<TObj, k> extends any[]
          ? FilterOperatorsByType<TypeForDottedKey<TObj, k>[0], Depth> | TypeForDottedKey<TObj, k>[0]
          : FilterOperatorsByType<TypeForDottedKey<TObj, k>, Depth> | TypeForDottedKey<TObj, k>
      : never
  ;


export type NestedFilterOfTSchema<TObj extends object, Depth extends DepthType> = {
  [k in (keyof TObj | RecursiveKeyOf<TObj, false>)]?: NestedFilterOfTSchemaValue<TObj, k, Depth>
}
interface RootFilterOperators<TSchema extends object, Depth extends DepthType> {
  $and?: NestedFilterOfTSchema<TSchema, Depth>[];
  $nor?: NestedFilterOfTSchema<TSchema, Depth>[];
  $or?: NestedFilterOfTSchema<TSchema, Depth>[];
  $where?: string | ((this: TSchema) => boolean);
  $expr?: Record<string, any>
}
export interface RootRootFilterOperators<TSchema extends object> extends RootFilterOperators<TSchema, DepthDefault> {
  $text?: {
    $search: string;
    $language?: string;
    $caseSensitive?: boolean;
    $diacriticSensitive?: boolean;
  };
  $comment?: string | Document;
}

export type FilterOfTSchema<TObj extends object> = NestedFilterOfTSchema<WithId<TObj>, DepthDefault> | RootRootFilterOperators<WithId<TObj>>;


export type CursorDescription<T> = {
  filter?: Filter<T>,
  options: {
    skip?: number,
    limit?: number,
    sort?: [string, 1 | -1][] | { [k in string]: 1 | -1},
    projection?: T extends object ? ProjectionOfTSchema<T> : never,
    disableOplog?: boolean
  }
}

export type WithCursorDescription<T> = {
  cursorDescription: CursorDescription<T>
}

export function isProjectionExclusion<TSchema extends Document>(projection: ProjectionOfTSchema<TSchema>, isTop: boolean = false) {
  const entry = Object.entries(projection).find(([key]) => key !== "_id");
  const first = isTop ? entry && entry[1] : Object.values(projection)[0];
  if (first === undefined) {
    return false;
  }
  if (typeof first === "object") {
    return false;
  }
  return !first;
}

function isFalse<TSchema extends Document>(value: AllPossibleValuesOfProjection<TSchema> | undefined) {
  return value === 0 || value === false;
}

function isTrue<TSchema extends Document>(value: AllPossibleValuesOfProjection<TSchema> | undefined) {
  return value === 1 || value === true;
}

export function combineProjections<TSchema extends Document>(
  left: AllPossibleValuesOfProjection<TSchema> | undefined,
  right: AllPossibleValuesOfProjection<TSchema> | undefined,
  leftParentIsExclusion: boolean,
  rightParentIsExclusion: boolean,
  depth: number = 0
) : {
  isExclusion: boolean,
  projection: AllPossibleValuesOfProjection<TSchema> | null,
  hasNestedKeys: boolean
} {
  if (isFalse(left) && isFalse(right)) {
    return {
      isExclusion: true,
      projection: 0,
      hasNestedKeys: false
    };
  }
  if (isTrue(left) && isTrue(right)) {
    return {
      isExclusion: false,
      projection: 1,
      hasNestedKeys: false
    };
  }
  if (isFalse(left) || isFalse(right)) {
    const other = isFalse(left) ? right : left;
    const otherParentIsExclusion = isFalse(left) ? rightParentIsExclusion : leftParentIsExclusion;
    if (typeof other === "object") {
      const otherIsExclusion = isProjectionExclusion(other as ProjectionOfTSchema<TSchema>, false);
      return {
        isExclusion: !otherIsExclusion,
        projection: otherIsExclusion ? other : {},
        hasNestedKeys: otherIsExclusion
      }
    }
    // if we're explicitly excluding this and the other isn't provided, but is part of an inclusion, we're fine to exclude it to
    else if (isTrue(other) || (other === undefined && otherParentIsExclusion)) {
      return {
        isExclusion: false,
        projection: {},
        hasNestedKeys: false
      };
    }
    else {
      return {
        isExclusion: true,
        projection: 0,
        hasNestedKeys: false
      };
    }
  }
  if (isTrue(left) || isTrue(right)) {
    const other = isTrue(left) ? right : left;
    const otherParentIsExclusion = isTrue(left) ? rightParentIsExclusion : leftParentIsExclusion;
    if (typeof other === "object") {
      const otherIsExclusion = isProjectionExclusion(other as ProjectionOfTSchema<TSchema>, false);
      return {
        isExclusion: false,
        projection: 1,
        hasNestedKeys: false
      }
    }
    else if (other === undefined && otherParentIsExclusion) {
      return {
        isExclusion: false,
        projection: null,
        hasNestedKeys: false
      };
    }
    else {
      return {
        isExclusion: false,
        projection: 1,
        hasNestedKeys: false
      };
    }
  }
  // at this point both left and right are objects.
  let result: ProjectionOfTSchema<TSchema> | 0 | 1 = {};
  const exclusionKeys = new Set<string>();
  let isExclusion = false;
  let hasKeys = true;
  const allKeys = Array.from(new Set([
    ...Object.keys(left || {}),
    ...Object.keys(right || {})
  ]));

  // we're using an array operator ($elemMatch or $slice)
  // we're going to return the entire array rather than trying to merge these stages
  if (allKeys.find(k => k.startsWith("$"))) {
    return {
      isExclusion: false,
      projection: 1,
      hasNestedKeys: false
    };
  }

  // at this point left and right are both Nested

  const isTop = depth === 0;
  const leftIsExclusion = left && typeof left === "object" ? isProjectionExclusion(left as ProjectionOfTSchema<TSchema>, false) : leftParentIsExclusion;
  const rightIsExclusion = right && typeof right === "object" ? isProjectionExclusion(right as ProjectionOfTSchema<TSchema>, false) : rightParentIsExclusion;
  allKeys.every((key) => {
    const leftValue: AllPossibleValuesOfProjection = left ? left[key]: undefined;
    const rightValue: AllPossibleValuesOfProjection = right ? right[key] : undefined;
    // _id is a special case at the top level.
    if (isTop && key === "_id") {
      if (isFalse(leftValue) && isFalse(rightValue)) {
        result["_id"] = 0;
        return true;
      }
      else if(!isFalse(leftValue) || !isFalse(rightValue)) {
        return true;
      }
    }
    const partialResult = combineProjections(leftValue, rightValue, leftIsExclusion, rightIsExclusion, depth + 1);
    isExclusion = isExclusion || partialResult.isExclusion;
    if (partialResult.isExclusion) {
      exclusionKeys.add(key);
    }
    if (partialResult.projection === null) {
      // do nothing - this happens when the top level is { a: 1 }, { b: 0 } we get null for a, and exclusion for b.
    }
    else if (typeof partialResult.projection === "object" && !partialResult.hasNestedKeys) {
      result = 1;
      hasKeys = false;
      // if we get here, there's a mismatch - e.g., a: 1, a: 0
      return false;
    }
    else {
      result[key] = partialResult.projection;
    }
    return true;
  });
  return {
    isExclusion: false,
    projection: isExclusion ? Object.fromEntries(Object.entries(result).filter(([key]) => exclusionKeys.has(key as string))) as ProjectionOfTSchema<TSchema> : result,
    hasNestedKeys: hasKeys
  };
}
export function unionOfProjections<TSchema extends Document>(projections: ProjectionOfTSchema<TSchema>[]): ProjectionOfTSchema<TSchema> {
  let result: ProjectionOfTSchema<TSchema> = projections[0] || {};
  projections.slice(1).forEach((projection) => {
    const partialRes = combineProjections(result, projection, false, false);
    result = partialRes && partialRes.projection as ProjectionOfTSchema<TSchema>;

    // this is where we deal with the mixture of dot and nested keys.
    const keys = Object.keys(result).sort((key1, key2) => key1.split(".").length - key2.split(".").length);
    const prefixes = new Set<string>();
    keys.forEach((key) => {
      const keyParts = key.split(".");
      for (let i = 1; i <= keyParts.length; i++) {
        const prefix = keyParts.slice(0, i).join(".");
        if (prefixes.has(prefix)) {
          delete result[key];
          break;
        }
        prefixes.add(prefix);
      }
    })

  });

  return result;
}
