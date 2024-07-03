import { Collection, Document } from "mongodb";

export declare class FakeCollection<TSchema extends Document = Document> extends Collection<TSchema> {

}
