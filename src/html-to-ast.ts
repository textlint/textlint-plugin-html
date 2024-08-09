// LICENSE : MIT
import type {
    TxtBlockQuoteNode,
    TxtBreakNode,
    TxtCodeBlockNode,
    TxtCodeNode,
    TxtCommentNode,
    TxtDeleteNode,
    TxtDocumentNode,
    TxtEmphasisNode,
    TxtHeaderNode,
    TxtHorizontalRuleNode,
    TxtHtmlNode,
    TxtImageNode,
    TxtLinkNode,
    TxtListItemNode,
    TxtListNode,
    TxtParagraphNode,
    TxtParentNode,
    TxtStrNode,
    TxtStrongNode,
    TxtTableCellNode,
    TxtTableNode,
    TxtTableRowNode
} from "@textlint/ast-node-types";
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import traverse, { TraverseContext } from "neotraverse";
import { StructuredSource } from "structured-source";
import type { Element, RootContent } from "hast";
import { nodeTypes, tagNameToType } from "./mapping.js";

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
                // We can not use "Html" type because some rule ignore node under the "Html" node.
                // So, We use "unknown" type instead of "Html".
                // https://github.com/textlint-ja/textlint-rule-no-synonyms/issues/4
                node.type = "unknown" as const;
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
            const txtNode = node as TxtBlockQuoteNode |
                TxtBreakNode |
                TxtCodeBlockNode |
                TxtCommentNode |
                TxtDeleteNode |
                TxtDocumentNode |
                TxtEmphasisNode |
                TxtHeaderNode |
                TxtHorizontalRuleNode |
                TxtHtmlNode |
                TxtImageNode |
                TxtLinkNode |
                TxtListItemNode |
                TxtListNode |
                TxtParagraphNode |
                TxtCodeNode |
                TxtStrNode |
                TxtStrongNode |
                TxtTableNode |
                TxtTableRowNode |
                TxtTableCellNode;
            if (txtNode.type === "Link") {
                if (txtNode.properties.href !== undefined) txtNode.url = txtNode.properties.href;
                if (txtNode.properties.title !== undefined) txtNode.title = txtNode.properties.title;
            } else if (txtNode.type === "Image") {
                if (txtNode.properties.alt !== undefined) txtNode.alt = txtNode.properties.alt;
                if (txtNode.properties.title !== undefined) txtNode.title = txtNode.properties.title;
                if (txtNode.properties.src !== undefined) txtNode.url = txtNode.properties.src;
            } else if (txtNode.type === "Header") {
                const depth = Number(txtNode.tagName.slice(1)) as TxtHeaderNode["depth"];
                if (depth > 0 && depth < 7) txtNode.depth = depth;
            } else if (txtNode.type === "List") {
                if (txtNode.tagName === "ul") {
                    txtNode.ordered = false;
                } else if (txtNode.tagName === "ol") {
                    txtNode.ordered = true;
                }
            }
        }
    });
    return ast as any as TxtParentNode;
}
