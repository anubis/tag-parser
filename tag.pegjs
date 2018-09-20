{
	const backslash = require('backslash');
	const debug = require('debug')('tag-parser:grammar');

	const flatten = list => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
}

tagfile
	= EOL? @(statement*)
	;

statement
	= indent:indentation? conditional:(@tag_conditional WS)? keyword:command_identifier _arguments:(WS @argument_list)? EOL
	{
		let res = {
			keyword,
			arguments: _arguments
		};

		if (conditional) {
			res = {conditional, value: res};
		}

		if (indent) {
			res.indent = true;
		}

		return res;
	}
	;

command_identifier "command name (must be upper case)"
	= $([A-Z]+)
	;

argument_list "argument list"
	= first:argument rest:(ws:WS n:argument {return [{skip: {literal: ws}}, n];})*
	{
		return flatten([first].concat(rest));
	}
	;

argument
	= quoted_string
	/ substitution
	/ basic_argument
	;

basic_argument
	= chars:(basic_char+)
	{
		const joined = chars.join('');
		return {literal: joined};
	}
	;

basic_char
	= escape_sequence
	/ (qs:quoted_string { return qs.join(''); })
	/ argument_chars
	;

quoted_string
	= '`' chars:quoted_char* '`'
	{
		const segments = [];
		for (const c of chars) {
			if (typeof c === 'string') {
				segments.push(c);
			} else {
				segments.push(c.join(''));
			}
		}

		const joined = segments.join('');
		return [() => joined];
	}
	;

quoted_char
	= substitution
	/ escape_sequence
	/ argument_chars
	/ literal_right_bracket
	/ WS
	;

literal_right_bracket
	= '}'
	{
		return {args: ['\x7d'], text: '\x7d'};
	}
	;

argument_chars
	= $([^\r\n`{\t \\#}]+)
	;

escape_sequence
	= '\\' ('u' HEX HEX HEX HEX / 'x' HEX HEX / [a-z0{}`\\])
	{
		const r = backslash(text());
		return {args: [r], text: r};
	}
	;

substitution
	= '{' @substitution_expression '}'
	;

substitution_expression
	= conditional_substitution_expression
	/ variable_reference
	;

conditional_substitution_expression
	= conditional:tag_conditional WS value:argument_list
	{
		value = flatten(value);
		return conditional && conditional.length > 0
			? {conditional, value}
			: value;
	}
	;

variable_reference
	= optional:'?'? name:(substitution / i:identifier {return [{literal: i}];})
	{
		const res = {
			substitution: name
		};

		if (optional) {
			res.optional = true;
		}

		return [res];
	}
	;

tag_conditional
	= f:tag_condition r:(WS @tag_condition)*
	{
		return [f].concat(r);
	}
	;

tag_condition "tag condition"
	= positive:[@!] path:identifier
	{
		return {[positive === '@' ? 'tagPositive' : 'tagNegative']: path}
	}
	;

identifier "identifier"
	= $([a-z_+]i [a-z0-9_+:]i*)
	;

comment "comment"
	= '#' [^\r\n]+
	;

indentation "indentation"
	= $('\t' / ' '+)
	;

HEX
	= [a-f0-9]i
	;

NL "newline"
	= '\r'? '\n'
	;

EOL "EOL"
	= (WS? comment? NL)+
	{
		return undefined;
	}
	;

WS "whitespace"
	= $([\t ]+)
	;
