const path = require("path");
const shell = require("shelljs");
const testRootDirectory = path.join(__dirname, "test");

// textlint.setupRules({}, {}) => const options
function rewriteSetupRuleWithOption() {
    const ruleAndRuleOptionPattern = "textlint.setupRules({ $ruleId: $rule }, { $ruleId: $ruleOption });";
    const ruleAndRuleOptionPatternExpected = `const rule = {
    ruleId: {{ruleId}},
    rule: {{rule}},
    options: {{ruleOption}}
};`;
    shell.exec(
        `npx grasp --in-place -r -e '${ruleAndRuleOptionPattern}' --replace '${ruleAndRuleOptionPatternExpected}' ${testRootDirectory}`
    );
}

// textlint.setupRules({}) => const options
function rewriteSetupRule() {
    const ruleAndRuleOptionPattern = "textlint.setupRules({ $ruleId: $rule });";
    const ruleAndRuleOptionPatternExpected = `const rule = {
    ruleId: {{ruleId}},
    rule: {{rule}}
};`;
    shell.exec(
        `npx grasp --in-place -r -e '${ruleAndRuleOptionPattern}' --replace '${ruleAndRuleOptionPatternExpected}' ${testRootDirectory}`
    );
}

// textlint.setupFilterRules({}, {}) => const options
function rewriteSetupFilterRuleWithOption() {
    const ruleAndRuleOptionPattern = "textlint.setupFilterRules({ $ruleId: $rule }, { $ruleId: $ruleOption });";
    const ruleAndRuleOptionPatternExpected = `const filterRule = {
    ruleId: {{ruleId}},
    rule: {{rule}},
    options: {{ruleOption}}
};`;
    shell.exec(
        `npx grasp --in-place -r -e '${ruleAndRuleOptionPattern}' --replace '${ruleAndRuleOptionPatternExpected}' ${testRootDirectory}`
    );
}

// setupPlugin({}) => const options
function rewriteSetupPlugins() {
    const ruleAndRuleOptionPattern = "textlint.setupPlugins({ $pluginId: $plugin });";
    const ruleAndRuleOptionPatternExpected = `const plugin = {
    pluginId: "{{pluginId}}",
    plugin: {{plugin}},
};`;
    shell.exec(
        `npx grasp --in-place -r -e '${ruleAndRuleOptionPattern}' --replace '${ruleAndRuleOptionPatternExpected}' ${testRootDirectory}`
    );
}

// textlint.setupRules({}) => const options
function rewriteSetupFilterRule() {
    const ruleAndRuleOptionPattern = "textlint.setupFilterRules({ $ruleId: $rule });";
    const ruleAndRuleOptionPatternExpected = `const filterRule = {
    ruleId: {{ruleId}},
    rule: {{rule}}
};`;
    shell.exec(
        `npx grasp --in-place -r -e '${ruleAndRuleOptionPattern}' --replace '${ruleAndRuleOptionPatternExpected}' ${testRootDirectory}`
    );
}

// textlint.lintMarkdown("text") => textlint.lintText(text, options);
function rewriteLintMarkdown() {
    const lintMarkdownPattern = `textlint.lintMarkdown( $text )`;
    const lintMarkdownPatternExpected = `textlint.lintText({{text}}, { ...options, ext: ".md" })`;
    shell.exec(
        `npx grasp --in-place -r -e '${lintMarkdownPattern}' --replace '${lintMarkdownPatternExpected}' ${testRootDirectory}`
    );
}

// textlint.lintFile(filePath) => textlint.lintFile(text, options);
function rewriteLintFile() {
    const pattern = `textlint.lintFile( $filePath )`;
    const expected = `textlint.lintText(fs.readFileSync( {{filePath}}, "utf-8"), { ...options, ext: path.extname({{filePath}}), filePath })`;
    shell.exec(`npx grasp --in-place -r -e '${pattern}' --replace '${expected}' ${testRootDirectory}`);
}

function rewriteCore() {
    const pattern = `textlint = new TextLintCore();`;
    const expected = `textlint = new TextlintKernel()`;
    shell.exec(`npx grasp --in-place -r -e '${pattern}' --replace '${expected}' ${testRootDirectory}`);
}

rewriteSetupRuleWithOption();
rewriteSetupRule();
rewriteSetupFilterRuleWithOption();
rewriteSetupFilterRule();
rewriteSetupPlugins();
rewriteLintMarkdown();
rewriteLintFile()
rewriteCore();
