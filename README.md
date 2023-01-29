# textlint-plugin-html [![Actions Status: test](https://github.com/textlint/textlint-plugin-html/workflows/test/badge.svg)](https://github.com/textlint/textlint-plugin-html/actions?query=workflow%3A"test")

Add HTML support for [textlint](https://github.com/textlint/textlint "textlint").

What is textlint plugin? Please see <https://github.com/textlint/textlint/blob/master/docs/plugin.md>

## Installation

    npm install textlint-plugin-html

Requirements:

- textlint v13+

## Default supported extensions

- `.html`
- `.htm`

## Usage

Manually add text plugin to do following:

```
{
    "plugins": [
        "html"
    ]
}
```

Lint HTML file with textlint

```
$ textlint index.html
```

### Options
 - `extensions`: `string[]`
    - Additional file extensions for html

For example, if you want to treat `.custom-ext` as html, put following config to `.textlintrc`

 ```json
{
    "plugins": {
        "html": {
            "extensions": [".custom-ext"]
        }
    }
}
```

## Tests

    npm test

## Development

If you update snapshot, please run `npm run updateSnapshot`.

### Add new test case

1. add new fixture file to `test/ast-test-case/<test-case-name>/index.html`
2. npm run updateSnapshot
3. check outputs

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
