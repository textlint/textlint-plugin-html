// LICENSE : MIT
"use strict";
import assert from "assert";
import HTMLPlugin from "../src/index.js"
import { parse } from "../src/html-to-ast.js";
import { tagNameToType } from "../src/mapping.js";
import { TextlintKernel } from "@textlint/kernel"
import path from "path";
import { moduleInterop } from "@textlint/module-interop";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getBodyNode = (ast: ReturnType<typeof parse>) => {
    const html = ast.children.find(node => {
        // @ts-expect-error: html is custom type
        return node.type === "html";
    });
    if (!html) {
        throw new Error("Not found html node");
    }
    // @ts-expect-error: html is custom type
    const body = html.children.find(node => {
        return node.type === "body";
    });
    if (!body) {
        throw new Error("Not found body node");
    }
    return body
}
describe("HTMLProcessor-test", function () {
    describe("#parse", function () {
        it("should return AST", function () {
            const result = parse(`<div><p><span>aaaa</span></p></div>`);
            assert(result.type === "Document");
        });
        it("should map type to TxtNode's type", function () {
            function createTag(tagName: string) {
                return `<${tagName}></${tagName}>`;
            }

            function testMap(typeMap: { [key: string]: string }) {
                Object.keys(typeMap).forEach(tagName => {
                    const result = parse(`<!DOCTYPE html><html lang="en"><head><title>test</title></head><body>${createTag(tagName)}</body></html>`);
                    assert(result.type === "Document");
                    const firstChild = getBodyNode(result).children[0];
                    const expectedType = typeMap[tagName];
                    assert.strictEqual(firstChild.type, expectedType);
                });
            }

            testMap(tagNameToType);
        });
    });
    describe("HTMLPlugin", function () {
        context("when target file is a HTML", function () {
            it("should report error", async function () {
                const textlint = new TextlintKernel()
                const plugin = {
                    pluginId: "html",
                    plugin: HTMLPlugin,
                };
                const rule = {
                    ruleId: "no-todo",
                    // @ts-ignore
                    rule: moduleInterop((await import("textlint-rule-no-todo")).default)
                };
                const options = {
                    plugins: [plugin],
                    rules: [rule]
                };
                const fixturePath = path.join(__dirname, "/fixtures/test.html");
                return textlint.lintText(fs.readFileSync(fixturePath, "utf-8"), {
                    ...options,
                    ext: path.extname(fixturePath),
                    filePath: fixturePath
                }).then(results => {
                    assert(results.messages.length > 0);
                    assert(results.filePath === fixturePath);
                });
            });
        });
        context("support file extensions", function () {
            it("support {.html, .htm}", async function () {
                const textlint = new TextlintKernel()
                const plugin = {
                    pluginId: "html",
                    plugin: HTMLPlugin,
                };
                const rule = {
                    ruleId: "no-todo",
                    // @ts-ignore
                    rule: moduleInterop((await import("textlint-rule-no-todo")).default)
                };
                const options = {
                    plugins: [plugin],
                    rules: [rule]
                }
                const fixturePathList = [
                    path.join(__dirname, "/fixtures/test.html"),
                    path.join(__dirname, "/fixtures/test.htm")
                ];
                const promises = fixturePathList.map((filePath) => {
                    return textlint.lintText(fs.readFileSync(filePath, "utf-8"), {
                        ...options,
                        ext: path.extname(filePath),
                        filePath
                    }).then(results => {
                        assert(results.messages.length > 0);
                        assert(results.filePath === filePath);
                    });
                });
                return Promise.all(promises);
            });
        });
        context("when extensions option is specified", function () {
            it("should report error", async function () {
                const textlint = new TextlintKernel()
                const plugin = {
                    pluginId: "html",
                    plugin: HTMLPlugin,
                    options: {
                        extensions: [".custom"]
                    }
                };
                const rule = {
                    ruleId: "no-todo",
                    // @ts-ignore
                    rule: moduleInterop((await import("textlint-rule-no-todo")).default)
                };
                const options = {
                    plugins: [plugin],
                    rules: [rule]
                }
                const filePath = path.join(__dirname, "/fixtures/test.custom")
                return textlint.lintText(fs.readFileSync(filePath, "utf-8"), {
                    ...options,
                    ext: path.extname(filePath),
                    filePath
                }).then(results => {
                    assert(results.messages.length > 0);
                    assert(results.filePath === filePath);
                });
            });
        });
    });
});
