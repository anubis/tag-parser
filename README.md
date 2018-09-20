# tag-parser

Parser module for the Tag scripting langauge.

## Installation

```console
$ npm install --save tag-parser
```

## Usage

```javascript
const parseTagfile = require('tag-parser');

const tagfile = parseTagfile(`
SET NAME Qix-
@greet ECHO Hello, {NAME}!
`);

console.log(require('util').inspect(tagfile));
```

If there's a syntax error, PegJS will throw with a typical
`SyntaxError` with `.location` information attached.

# License
Copyright &copy; 2018 by Josh Junon. Licensed under the MIT license.
