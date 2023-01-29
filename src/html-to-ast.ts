// LICENSE : MIT
import type { TxtParentNode } from "@textlint/ast-node-types";
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import traverse, { TraverseContext } from "traverse";
import { StructuredSource } from "structured-source";
import { nodeTypes, tagNameToType } from "./mapping.js";
import { Element, RootContent } from "hast";

/**
 * Remove undocumented properties on TxtNode from node
 */
// function removeUnusedProperties(node: Element) {
//     if (typeof node !== "object") {
//         return;
//     }
//     ["position"].forEach(function (key) {
//         if (node.hasOwnProperty(key)) {
//             // @ts-expect-error: delete key
//             delete node[key];
//         }
//     });
// }

function mapNodeType(node: RootContent, parent: TraverseContext | undefined) {
    if (parent) {
        const parentNode = parent.parent?.node;
        if (parentNode?.tagName === "script" || parentNode?.tagName === "style") {
            return "CodeBlock";
        }
    }
    if (node.type === "element") {
        // @ts-expect-error: tagName is string
        const mappedType = tagNameToType[node.tagName];
        if (mappedType) {
            // p => Paragraph...
            return mappedType;
        } else {
            // other case, return original tagName
            return node.tagName;
        }
    } else if (node.type === "doctype") {
        return "doctype";
    } else if (node.type in nodeTypes) {
        // mappable node type
        // text => Str
        return nodeTypes[node.type];
    }
    // The other node is original node.type because it is not defined in textlint's AST
    // Almost rule should not handle this node.
    // https://github.com/textlint/textlint-plugin-html/issues/19
    return node.type;
}

export type ParseOptions = {
    debug: boolean;
}

export function parse(html: string, options?: ParseOptions) {
    const isDebug = process.env.DEBUG?.startsWith("textlint:html") ?? options?.debug ?? false;
    const parseHtml = unified().use(rehypeParse)
    const ast = parseHtml.parse(html);
    const src = new StructuredSource(html);
    const tr = traverse(ast);
    const getNearParentWithPosition = (context: TraverseContext): Element | undefined => {
        if ("position" in context.node) {
            return context.node;
        }
        if (context.parent) {
            return getNearParentWithPosition(context.parent);
        }
        return;
    }
    tr.forEach(function (node) {
        if (typeof node === "object" && !Array.isArray(node)) {
            // it is not leaf node
            if (!("type" in node)) {
                return;
            }
            // backup
            if (isDebug) {
                Object.defineProperty(node, "_debug_type", {
                    value: node.type,
                })
            }
            // avoid conflict <input type="text" />
            // AST node has type and position
            if (node.type) {
                // case: element => Html or ...
                node.type = mapNodeType(node, this.parent);
            } else {
                // node.type = "Html" as const;
            }
            // map `range`, `loc` and `raw` to node
            if (typeof node.position === "object") {
                const position = node.position;
                // TxtNode's line start with 1
                // TxtNode's column start with 0
                const positionCompensated = {
                    start: { line: position.start.line, column: position.start.column - 1 },
                    end: { line: position.end.line, column: position.end.column - 1 }
                } as const;
                const range = src.locationToRange(positionCompensated);
                node.loc = positionCompensated;
                node.range = range;
                node.raw = html.slice(range[0], range[1]);
            } else if (this.parent?.node) {
                const parentNode = getNearParentWithPosition(this.parent);
                if (!parentNode) {
                    return;
                }
                const position = parentNode.position;
                if (!position) {
                    return;
                }
                // TxtNode's line start with 1
                // TxtNode's column start with 0
                const positionCompensated = {
                    start: { line: position.start.line, column: position.start.column - 1 },
                    end: { line: position.end.line, column: position.end.column - 1 }
                } as const;
                const range = src.locationToRange(positionCompensated);
                node.loc = positionCompensated;
                node.range = range;
                node.raw = html.slice(range[0], range[1]);
            }
            // === properties ===
            // map `url` to Link node
            if (node.type === "Link" && typeof node.properties.href !== "undefined") {
                node.url = node.properties.href;
            }
        }
        // removeUnusedProperties(node);
    });
    return ast as any as TxtParentNode;
}

