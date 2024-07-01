import type { FindCursor } from "mongodb";
import type { WithCursorDescription, CursorDescription } from "../lib/index.js";

export declare class FakeFindCursor<TSchema> extends FindCursor<TSchema> implements WithCursorDescription<TSchem> {
  get cursorDescription(): CursorDescription<TSchema>
}
