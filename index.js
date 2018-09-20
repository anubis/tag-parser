const fs = require('fs');
const path = require('path');

const pegjs = require('pegjs');

const tagGrammar = fs.readFileSync(path.join(__dirname, 'tag.pegjs'), 'utf-8');

const tagParser = pegjs.generate(tagGrammar, {
	allowedStartRules: ['tagfile']
});

function parseTagfile(source) {
	return tagParser.parse(source + '\n');
}

module.exports = parseTagfile;
