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

const dumpTreeView = (node, depth = 0) => {
    let output = "";
    const indent = " ".repeat(depth * 2);
    if (!node.type) {
        console.error(node);
    }
    output += `${indent}${node.type}(${node._debug_type})\n`;
    if (node.children) {
        node.children.forEach(child => {
            output += dumpTreeView(child, depth + 1);
        });
    }
    return output;
}
const assertUndefinedType = (node) => {
    if (!"type" in node) {
        console.error(node);
        throw new Error(`Unknown type: ${node._debug_type}`);
    }
    if (node.children) {
        node.children.forEach(child => {
            assertUndefinedType(child);
        });
    }
}
// test-case is come from https://github.com/wooorm/rehype
describe("Snapshot testing", () => {
    fs.readdirSync(fixturesDir)
        .map(caseName => {
            const normalizedTestName = caseName.replace(/-/g, " ");
            it(`Test ${normalizedTestName}`, async function () {
                const fixtureDir = path.join(fixturesDir, caseName);
                const actualFilePath = path.join(fixtureDir, "index.html");
                const actualContent = fs.readFileSync(actualFilePath, "utf-8");
                const actual = parse(actualContent, {
                    debug: true
                });
                const expectedFilePath = path.join(fixtureDir, "index.json");
                const expectedOutputTreeFilePath = path.join(fixtureDir, "output-tree.txt");
                // Usage: update snapshots
                // UPDATE_SNAPSHOT=1 npm test
                if (!fs.existsSync(expectedFilePath) || process.env.UPDATE_SNAPSHOT) {
                    fs.writeFileSync(expectedFilePath, JSON.stringify(actual, null, 4));
                    fs.writeFileSync(expectedOutputTreeFilePath, dumpTreeView(actual));
                    this.skip(); // skip when updating snapshots
                    return;
                }
                assertUndefinedType(actual);
                const expectedOutputTree = fs.readFileSync(expectedOutputTreeFilePath, "utf-8");
                assert.strictEqual(dumpTreeView(actual), expectedOutputTree);
                // compare input and output
                const expectedContent = JSON.parse(fs.readFileSync(expectedFilePath, "utf-8"));
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
