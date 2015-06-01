(function () {
	'use strict';

	var symbolMapping = new Map([
		['!', 'bang'],
		['$', 'dollar'],
		['%', 'mod'],
		['^', 'xor'],
		['&', 'and'],
		['*', 'star'],
		['-', 'dash'],
		['=', 'equal'],
		['+', 'plus'],
		['<', 'lesser'],
		['>', 'greater'],
		['?', 'question']
	]);

	var keywords = new Set([
		'break',
		'case',
		'class',
		'catch',
		'const',
		'continue',
		'debugger',
		'default',
		'delete',
		'do',
		'else',
		'export',
		'extends',
		'finally',
		'for',
		'function',
		'if',
		'import',
		'in',
		'instanceof',
		'let',
		'new',
		'return',
		'super',
		'switch',
		'this',
		'throw',
		'try',
		'typeof',
		'var',
		'void',
		'while',
		'with',
		'yield'
	]);

	// custom one-argument memoizer
	function memoize(fun) {
		var cache = new Map();

		return function (arg1) {
			if (!cache.has(arg1)) {
				var result = fun(arg1);
				cache.set(arg1, result);
			}

			return cache.get(arg1);
		};
	}

	var encodeIdentifier = memoize(function (identifier) {
		if (keywords.has(identifier)) {
			return '$' + identifier;
		}

		var safeIdentifier = '';
		for (var i = 0; i < identifier.length; i++) {
			safeIdentifier += symbolMapping.has(identifier[i]) ?
				'$' + symbolMapping.get(identifier[i]) :
				identifier[i];
		}

		return safeIdentifier;
	});

	if (!window.cps) { window.cps = {}; }
	window.cps.encodeIdentifier = encodeIdentifier;
})();