(function () {
	'use strict';

	var subs = {
		'if': 3,
		'let': 3,
		'set!': 3,
		'lambda': 2,
		'fun': 3,
		'call/cc': 1
	};

	function buildCall(call) {
		// (call (call (call callee x) y) z)
		// (callee x y z)
		var ret = buildAst(call.tree[0]);
		for (var i = 1; i < call.tree.length; i++) {
			ret = {
				type: 'call',
				callee: ret,
				param: buildAst(call.tree[i])
			};
		}
		return ret;
	}

	function buildLambda(lambda) {
		// (lambda x (lambda y (lambda z body)))
		// (lambda (x y z) body)
		if (lambda.tree[1].token.type !== '(') {
			throw new Error('missing parameter list for anonymous function');
		}

		var params = lambda.tree[1].tree;
		var ret = buildAst(lambda.tree[2]);
		for (var i = params.length - 1; i >= 0; i--) {
			if (params[i].token.type !== 'alphanum') {
				throw new Error('formal parameters must be alphanums');
			}

			ret = {
				type: 'lambda',
				param: params[i].token.value,
				body: ret
			};
		}
		return ret;
	}

	function buildFun(fun) {
		// (fun f x (lambda y (lambda z body)))
		// (fun f (x y z) body)
		if (fun.tree[1].token.type !== 'alphanum') {
			throw new Error('function name must be an alphanum');
		}

		if (fun.tree[2].token.type !== '(') {
			throw new Error('missing parameter list for function');
		}

		var params = fun.tree[2].tree;
		var ret = buildAst(fun.tree[3]);
		for (var i = params.length - 1; i >= 1; i--) {
			if (params[i].token.type !== 'alphanum') {
				throw new Error('formal parameters must be alphanums');
			}

			ret = {
				type: 'lambda',
				param: params[i].token.value,
				body: ret
			};
		}
		ret = {
			type: 'fun',
			name: fun.tree[1].token.value,
			param: params[i].token.value,
			body: ret
		};
		return ret;
	}

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
				if (tree.tree[0].token.type === 'alphanum') {
					var formType = tree.tree[0].token.value;
					if (subs[formType] !== undefined) {
						if (subs[formType] !== tree.tree.length - 1) {
							throw new Error(formType + ' special form admits ' + subs[formType] + ' parameters');
						}
					}
				}

				switch (formType) {
					case 'if':
						return {
							type: 'if',
							cond: buildAst(tree.tree[1]),
							e1: buildAst(tree.tree[2]),
							e2: buildAst(tree.tree[3])
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
						return buildLambda(tree);
					case 'fun':
						return buildFun(tree);
					case 'call/cc':
						return {
							type: 'call/cc',
							callee: buildAst(tree.tree[1])
						};
					default:
						return buildCall(tree);
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