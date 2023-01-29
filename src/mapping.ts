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
    "img": "Image",
    "h1": "Header",
    "h2": "Header",
    "h3": "Header",
    "h4": "Header",
    "h5": "Header",
    "h6": "Header",
} as const;

export const nodeTypes = {
    "root": "Document",
    "comment": "Comment",
    'text': 'Str',
} as const;
