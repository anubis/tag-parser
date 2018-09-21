const fs = require('fs');
const path = require('path');

const pegjs = require('pegjs');

const tagGrammar = fs.readFileSync(path.join(__dirname, 'tag.pegjs'), 'utf-8');

const pegOpts = {
	allowedStartRules: ['tagfile']
};

const tagParser = pegjs.generate(tagGrammar, pegOpts);

if ('DEBUG_TAG_PARSER' in process.env) {
	const fs = require('fs');
	fs.writeFileSync('/tmp/tag-parser.js', pegjs.generate(tagGrammar, {
		...pegOpts,
		output: 'source'
	}));
}

function parseTagfile(source) {
	return tagParser.parse(source + '\n');
}

module.exports = parseTagfile;
