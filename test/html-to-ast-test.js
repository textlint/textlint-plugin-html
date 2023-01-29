// LICENSE : MIT
"use strict";
import assert from "assert";
import fs from "fs";
import path from "path";
import { test } from "@textlint/ast-tester";
import { parse } from "../src/html-to-ast.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, "ast-test-case");

// test-case is come from https://github.com/wooorm/rehype
describe("Snapshot testing", () => {
    fs.readdirSync(fixturesDir)
        .map(caseName => {
            const normalizedTestName = caseName.replace(/-/g, " ");
            it(`Test ${normalizedTestName}`, async function () {
                const fixtureDir = path.join(fixturesDir, caseName);
                const actualFilePath = path.join(fixtureDir, "index.html");
                const actualContent = fs.readFileSync(actualFilePath, "utf-8");
                const actual = parse(actualContent);
                const expectedFilePath = path.join(fixtureDir, "index.json");
                // Usage: update snapshots
                // UPDATE_SNAPSHOT=1 npm test
                if (!fs.existsSync(expectedFilePath) || process.env.UPDATE_SNAPSHOT) {
                    fs.writeFileSync(expectedFilePath, actual);
                    this.skip(); // skip when updating snapshots
                    return;
                }
                // compare input and output
                const expectedContent = fs.readFileSync(expectedFilePath, "utf-8");
                assert.deepStrictEqual(
                    actual,
                    expectedContent
                );
            });
        });
});

describe("html-to-ast-test", function () {
    it("should return AST that passed isTxtAST", function () {
        const fixture = fs.readFileSync(path.join(__dirname, "fixtures/wikipedia.html"), "utf-8");
        const AST = parse(fixture);
        test(AST);
    });
});
