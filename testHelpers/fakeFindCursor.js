import { Minimongo } from "@blastjs/minimongo";

export class FakeFindCursor {
  #i = 0;
  #id;
  #data;
  #dataFilteredAndSorted
  #transform;
  #filter;
  #options;
  #comparator;
  #matcher;
  constructor(data = [], filter, options, transform = a => a) {
    this.#data = data;
    this.#filter = filter;
    this.#options = options || {};
    this.#transform = transform;
    this.#comparator = options?.sort ? new Minimongo.Sorter(options.sort).getComparator() : () => 0;
    this.#matcher = new Minimongo.Matcher(filter || {});
    this.#i = this.#options.skip || 0;
  }

  get cursorDescription() {
    return {
      collection: this.#options.collection,
      filter: this.#filter,
      options: {
        skip: this.#options.skip,
        limit: this.#options.limit,
        projection: this.#options.projection,
        sort: this.#options.sort
      }
    };
  }

  get _data() {
    return this.#data;
  }

  get id() {
    return this.#id;
  }

  #applyProjection(obj) {
    // simple only
    let copy = {};
    if (!this.#options.projection || Object.entries(this.#options.projection).length === 0) {
      copy = obj;
    }
    if (obj && typeof obj === "object" && this.#options.projection?._id !== 0) {
      copy._id = obj._id;
    }
    Object.entries(this.#options.projection || {}).filter(([, value]) => value === 1 || value === true || typeof value === "object").forEach(([key, value]) => {
      if (typeof value === "object" && typeof obj[key] === "object") {
        copy[key] = {};
        Object.keys(value).forEach((pk) => {
          copy[key][pk] = obj[key][pk];
        });
      }
      else if (Object.hasOwnProperty.call(obj, key)) {
        copy[key] = obj[key];
      }
      else if (key.includes(".")) {
        let newObj = obj;
        let newCopy = copy;
        const parts = key.split(".");
        let bad = false;
        parts.slice(0, -1).forEach(part => {
          if (typeof newObj[part] === "object") {
            newObj = newObj[part];
            if (!newCopy[part]) {
              newCopy[part] = {};
            }
            newCopy = newCopy[part];
          }
          else {
            bad = true;
          }
        });
        if (!bad) {
          newCopy[parts.slice(-1)[0]] = newObj[parts.slice(-1)[0]];
        }
      }
    });
    return copy;
  }

  #init() {
    if (!this.#dataFilteredAndSorted) {
      this.#dataFilteredAndSorted = this.#data
      .filter(doc => (typeof doc === "object" ? this.#matcher.documentMatches(doc).result : true));

      this.#dataFilteredAndSorted.sort(this.#comparator);
      this.#dataFilteredAndSorted = this.#dataFilteredAndSorted.slice(this.#options.skip || 0, this.#options.limit ? (this.#options.skip || 0) + this.#options?.limit : undefined)
      .map(a => this.#applyProjection(JSON.parse(JSON.stringify(a))))
      .map(a => this.#transform(a));
    }
  }


  async toArray() {
    try {
      this.#init();
      return this.#dataFilteredAndSorted.slice(this.#i).map(doc => JSON.parse(JSON.stringify(doc)));
    }
    finally {
      this.rewind();
    }
  }

  async count() {
    this.#init();
    return this.#dataFilteredAndSorted.length;
  }

  async forEach(iterator) {
    this.#init();
    try {
      return this.#dataFilteredAndSorted.forEach(iterator);
    }
    finally {
      this.rewind();
    }
  }

  async rewind() {
    this.#i = 0;
    this.#dataFilteredAndSorted = null;
  }

  _initialize(cb) {
    this.#id = "fake";
    cb(undefined, {});
  }

  async next() {
    this.#init();
    if (this.#i === this.#options.limit) {
      this.rewind();
      return null;
    }
    const next = this.#dataFilteredAndSorted[this.#i++];
    if (!next) {
      this.rewind();
    }
    return next || null;
  }

  async* [Symbol.asyncIterator]() {
    this.#init();
    for (const item of this.#dataFilteredAndSorted) {
      this.#i++;
      yield item;
    }
    this.rewind();
  }

  clone() {
    return this;
  }

  project(projection) {
    this.#options.projection = projection;
    return this;
  }
  map(transform) {
    this.#transform = transform;
    return this;
  }

  async close() {

  }
}

