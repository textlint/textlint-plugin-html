// LICENSE : MIT
"use strict";
export const tagNameToType = {
    "p": "Paragraph",
    "ul": "List",
    "ol": "List",
    "li": "ListItem",
    "q": "BlockQuote",
    "blockquote": "BlockQuote",
    "code": "CodeBlock",
    "hr": "horizontalRule",
    "br": "break",
    "em": "Emphasis",
    "strong": "Strong",
    "a": "Link",
    "img": "Image"
} as const;

export const nodeTypes = {
    "root": "Document",
    "paragraph": "Paragraph",
    "blockquote": "BlockQuote",
    "listItem": "ListItem",
    "list": "List",
    "Bullet": "Bullet", // no need?
    "heading": "Header",
    "code": "CodeBlock",
    "comment": "Comment",
    "HtmlBlock": "Html",
    "ReferenceDef": "ReferenceDef",
    "horizontalRule": "HorizontalRule",
    // inline block
    'text': 'Str',
    'break': 'Break',
    'emphasis': 'Emphasis',
    'strong': 'Strong',
    'html': 'Html',
    'link': 'Link',
    'image': 'Image',
    'inlineCode': 'Code',
    'yaml': 'Yaml'
} as const;
