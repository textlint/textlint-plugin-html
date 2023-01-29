// LICENSE : MIT
"use strict";
import {parse} from "./html-to-ast.js";
export default class HTMLProcessor {
    constructor(config) {
        this.config = config;
        this.extensions = this.config.extensions ? this.config.extensions : [];
    }

    availableExtensions() {
        return [
            ".htm",
            ".html"
        ].concat(this.extensions);
    }

    processor(ext) {
        return {
            preProcess(text, filePath) {
                return parse(text);
            },
            postProcess(messages, filePath) {
                return {
                    messages,
                    filePath: filePath ? filePath : "<html>"
                };
            }
        };
    }
}
