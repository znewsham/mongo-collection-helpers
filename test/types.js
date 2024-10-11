import path from "node:path";
import fs from "fs/promises";
import { describe, it } from "node:test";
import assert from "node:assert";

// eslint-disable-next-line
import ts from "typescript";
const dirName = path.dirname(import.meta.url.replace("file://", ""));

const expectedErrors = new Map([
  [
    "types/projections/$inMiddle.ts",
    ["/types/projections/$inMiddle.ts (8,3): Object literal may only specify known properties, and '\"a.$.b\"' does not exist in type 'NestedProjectionOfTSchema<T>'."]
  ],
  [
    "types/projections/$elemMatchInvalidKey.ts",
    [
      "/types/projections/$elemMatchInvalidKey.ts (10,7): Type 'number' is not assignable to type 'StringOperators<string>'.",
      "/types/projections/$elemMatchInvalidKey.ts (17,16): Object literal may only specify known properties, and 'd' does not exist in type 'NestedFilterOfTSchema<{ b: number; c: string; }>'."
    ]
  ]
]);

function compile(fileNames) {
  const program = ts.createProgram(
    fileNames.map(fname => path.join(dirName, fname)),
    { noEmit: true }
  );
  const emitResult = program.emit();

  const allDiagnostics = ts
  .getPreEmitDiagnostics(program)
  .concat(emitResult.diagnostics);

  return allDiagnostics.map((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      return `${diagnostic.file.fileName.replace(dirName, "")} (${line + 1},${character + 1}): ${message}`;
    }
    return ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  });
}


describe("The types work as expected", { concurrency: 10 }, async () => {
  const files = await fs.readdir(path.join(dirName, "types"), { recursive: true, withFileTypes: true });
  files.filter(dirent => !dirent.isDirectory()).forEach(({ name, parentPath }) => {
    const testName = `${parentPath.replace(dirName, "").replace(/^\//, "")}/${name}`;
    it(`${testName} should work`, () => {
      const diagnostics = compile([testName]);
      const expectedErrorsForTest = expectedErrors.get(testName) || [];
      try {
        assert.deepEqual(diagnostics, expectedErrorsForTest, expectedErrorsForTest.length === 0 ? "Valid type" : "Correctly throws error");
      }
      catch (e) {
        console.warn(diagnostics);
        throw e;
      }
    });
  });
});
