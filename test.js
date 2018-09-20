const assert = require('assert');

const parser = require('.');

const FUNCID = '\0FUNC\0';

it('must parse a basic echo statement', () => {
	const statements = parser('ECHO hello there\ttabbed    multispace');
	assert.deepEqual(statements, [{
		keyword: 'ECHO',
		arguments: [
			{literal: 'hello'},
			{skip: {literal: ' '}},
			{literal: 'there'},
			{skip: {literal: '\t'}},
			{literal: 'tabbed'},
			{skip: {literal: '    '}},
			{literal: 'multispace'}
		]
	}]);
});

it('must parse a basic conditional echo statement', () => {
	const statements = parser('@foo !qux @bar !qix ECHO hello  there');
	assert.deepEqual(statements, [{
		conditional: [
			{tagPositive: 'foo'},
			{tagNegative: 'qux'},
			{tagPositive: 'bar'},
			{tagNegative: 'qix'}
		],
		value: {
			keyword: 'ECHO',
			arguments: [
				{literal: 'hello'},
				{skip: {literal: '  '}},
				{literal: 'there'}
			]
		}
	}]);
});

it('must parse indented (block) rules', () => {
	const statements = parser('RULE foo:   bar\n\tECHO make {in} -> {out}');

	assert.deepEqual(statements, [
		{
			keyword: 'RULE',
			arguments: [
				{literal: 'foo:'},
				{skip: {literal: '   '}},
				{literal: 'bar'}
			]
		},
		{
			keyword: 'ECHO',
			indent: true,
			arguments: [
				{literal: 'make'},
				{skip: {literal: ' '}},
				{substitution: [{literal: 'in'}]},
				{skip: {literal: ' '}},
				{literal: '->'},
				{skip: {literal: ' '}},
				{substitution: [{literal: 'out'}]}
			]
		}
	]);
});
