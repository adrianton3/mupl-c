(function () {
	'use strict';

	var subs = {
		'if': 3,
		'+': 2,
		'-': 2,
		'let': 3,
		'set!': 3,
		'lambda': 2,
		'fun': 3,
		'call': 2,
		'call/cc': 1
	};

	function buildAst(tree) {
		switch (tree.token.type) {
			case 'number':
				return {
					type: 'number',
					value: tree.token.value
				};
			case '(':
				if (!tree.tree.length) {
					throw new Error('Unexpected empty ()');
				}
				var formType = tree.tree[0].token.value;
				if (subs[formType] !== undefined) {
					if (subs[formType] !== tree.tree.length - 1) {
						throw new Error(formType + ' special form admits ' + subs[formType] + ' parameters');
					}
				} else {
					throw new Error('Unsupported special form', formType);
				}

				switch (formType) {
					case 'if':
						return {
							type: 'if',
							cond: buildAst(tree.tree[1]),
							e1: buildAst(tree.tree[2]),
							e2: buildAst(tree.tree[3])
						};
					case '+':
						return {
							type: '+',
							e1: buildAst(tree.tree[1]),
							e2: buildAst(tree.tree[2])
						};
					case '-':
						return {
							type: '-',
							e1: buildAst(tree.tree[1]),
							e2: buildAst(tree.tree[2])
						};
					case 'let':
						if (tree.tree[1].token.type !== 'alphanum') {
							throw new Error('can only bind to alphanums using let');
						}
						return {
							type: 'let',
							name: tree.tree[1].token.value,
							e: buildAst(tree.tree[2]),
							body: buildAst(tree.tree[3])
						};
					case 'set!':
						if (tree.tree[1].token.type !== 'alphanum') {
							throw new Error('bindings are referenced by alphanums when using set!');
						}
						return {
							type: 'set!',
							name: tree.tree[1].token.value,
							e: buildAst(tree.tree[2]),
							body: buildAst(tree.tree[3])
						};
					case 'lambda':
						if (tree.tree[1].token.type !== 'alphanum') {
							throw new Error('formal parameter must be an alphanum');
						}
						return {
							type: 'lambda',
							param: tree.tree[1].token.value,
							body: buildAst(tree.tree[2])
						};
					case 'fun':
						if (tree.tree[1].token.type !== 'alphanum') {
							throw new Error('function name must be an alphanum');
						}
						if (tree.tree[2].token.type !== 'alphanum') {
							throw new Error('formal parameter must be an alphanum');
						}
						return {
							type: 'fun',
							name: tree.tree[1].token.value,
							param: tree.tree[2].token.value,
							body: buildAst(tree.tree[3])
						};
					case 'call':
						return {
							type: 'call',
							calee: buildAst(tree.tree[1]),
							param: buildAst(tree.tree[2])
						};
					case 'call/cc':
						return {
							type: 'call/cc',
							calee: buildAst(tree.tree[1])
						};
				}
			case 'alphanum':
				return {
					type: 'var',
					name: tree.token.value
				};
			default:
				console.warn('Token type not supported');
		}
	}

	if (!window.cps) { window.cps = {}; }
	window.cps.buildAst = buildAst;
})();