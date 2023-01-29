// LICENSE : MIT
import { TextlintPluginProcessor } from "@textlint/types";
import { parse } from "./html-to-ast.js";

export type HTMLProcessorOptions = {
    extensions?: string[];
}
export default class HTMLProcessor implements TextlintPluginProcessor {
    config: HTMLProcessorOptions;
    extensions: string[];

    constructor(config: HTMLProcessorOptions) {
        this.config = config;
        this.extensions = this.config.extensions ? this.config.extensions : [];
    }

    availableExtensions() {
        return [
            ".htm",
            ".html"
        ].concat(this.extensions);
    }

    processor(_ext: string) {
        return {
            preProcess(text: string, _filePath: string) {
                return parse(text);
            },
            postProcess(messages: Array<any>, filePath?: string) {
                return {
                    messages,
                    filePath: filePath ? filePath : "<html>"
                };
            }
        };
    }
}
