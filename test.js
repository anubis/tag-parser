/* eslint-env mocha */

const assert = require('assert');

const parser = require('.');

describe('basics', () => {
	it('must parse a basic echo statement', () => {
		const statements = parser('ECHO hello there\ttabbed    multispace');
		assert.deepStrictEqual(statements, [{
			keyword: 'ECHO',
			arguments: [
				{literal: 'hello'},
				{literal: 'there'},
				{literal: 'tabbed'},
				{literal: 'multispace'}
			]
		}]);
	});

	it('must parse a basic conditional echo statement', () => {
		const statements = parser('@foo !qux @bar !qix ECHO hello  there');
		assert.deepStrictEqual(statements, [{
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
					{literal: 'there'}
				]
			}
		}]);
	});

	it('must parse indented (block) rules', () => {
		const statements = parser('@foo RULE foo:   bar\n\tECHO make {in} -> {out}');

		assert.deepStrictEqual(statements, [
			{
				conditional: [{tagPositive: 'foo'}],
				value: {
					keyword: 'RULE',
					arguments: [
						{literal: 'foo:'},
						{literal: 'bar'}
					]
				}
			},
			{
				keyword: 'ECHO',
				indent: true,
				arguments: [
					{literal: 'make'},
					{substitution: [{literal: 'in'}]},
					{literal: '->'},
					{substitution: [{literal: 'out'}]}
				]
			}
		]);
	});
});

describe('quotes strings', () => {
	it('must parse a basic quoted string', () => {
		const statements = parser('ECHO `Hello, World!`\nECHO `hello`\nECHO `hello\ttabbed!`\nECHO `hello there` `multiple args`');

		assert.deepStrictEqual(statements, [
			{
				keyword: 'ECHO',
				arguments: [
					{literal: 'Hello, World!'}
				]
			},
			{
				keyword: 'ECHO',
				arguments: [
					{literal: 'hello'}
				]
			},
			{
				keyword: 'ECHO',
				arguments: [
					{literal: 'hello\ttabbed!'}
				]
			},
			{
				keyword: 'ECHO',
				arguments: [
					{literal: 'hello there'},
					{literal: 'multiple args'}
				]
			}
		]);
	});

	it('must parse quoted strings and substitutions', () => {
		const statements = parser('ECHO `Hello, {name}!`');

		assert.deepStrictEqual(statements, [{
			keyword: 'ECHO',
			arguments: [
				{literal: 'Hello, '},
				{append: {substitution: [{literal: 'name'}]}},
				{append: {literal: '!'}}
			]
		}]);
	});

	it('must parse conditional substitutions', () => {
		const statements = parser('ECHO `testing: {@foo FOO IS ENABLED, {name}} (end test)`');

		assert.deepStrictEqual(statements, [{
			keyword: 'ECHO',
			arguments: [
				{literal: 'testing: '},
				{append: {
					conditional: [{tagPositive: 'foo'}],
					value: [
						{literal: 'FOO'},
						{literal: 'IS'},
						{literal: 'ENABLED,'},
						{substitution: [{literal: 'name'}]}
					]
				}},
				{append: {literal: ' (end test)'}}
			]
		}]);
	});

	it('must parse empty string literals', () => {
		const statements = parser('ECHO `hello` `` `` `world!`');
		assert.deepStrictEqual(statements, [{
			keyword: 'ECHO',
			arguments: [
				{literal: 'hello'},
				{literal: ''},
				{literal: ''},
				{literal: 'world!'}
			]
		}]);
	});
});
