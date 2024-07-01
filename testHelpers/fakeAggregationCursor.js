import { FakeFindCursor } from "./fakeFindCursor.js";

export class FakeAggregationCursor extends FakeFindCursor {
  #pipeline;
  #options;
  constructor(data, pipeline, options) {
    super(data);
    this.#pipeline = pipeline;
    this.#options = options;
  }
}
