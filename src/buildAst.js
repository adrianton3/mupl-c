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
		var ret = buildAst(call.children[0]);
		for (var i = 1; i < call.children.length; i++) {
			ret = {
				type: 'call',
				callee: ret,
				param: buildAst(call.children[i])
			};
		}
		return ret;
	}

	function buildLambda(lambda) {
		// (lambda x (lambda y (lambda z body)))
		// (lambda (x y z) body)
		if (lambda.children[1].token.type !== '(') {
			throw new Error('missing parameter list for anonymous function');
		}

		var params = lambda.children[1].children;
		var ret = buildAst(lambda.children[2]);
		for (var i = params.length - 1; i >= 0; i--) {
			if (params[i].token.type !== 'identifier') {
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
		if (fun.children[1].token.type !== 'identifier') {
			throw new Error('function name must be an alphanum');
		}

		if (fun.children[2].token.type !== '(') {
			throw new Error('missing parameter list for function');
		}

		var params = fun.children[2].children;
		var ret = buildAst(fun.children[3]);
		for (var i = params.length - 1; i >= 1; i--) {
			if (params[i].token.type !== 'identifier') {
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
			name: fun.children[1].token.value,
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
				if (!tree.children.length) {
					throw new Error('Unexpected empty ()');
				}
				if (tree.children[0].token.type === 'identifier') {
					var formType = tree.children[0].token.value;
					if (subs[formType] !== undefined) {
						if (subs[formType] !== tree.children.length - 1) {
							throw new Error(formType + ' special form admits ' + subs[formType] + ' parameters');
						}
					}
				}

				switch (formType) {
					case 'if':
						return {
							type: 'if',
							cond: buildAst(tree.children[1]),
							e1: buildAst(tree.children[2]),
							e2: buildAst(tree.children[3])
						};
					case 'let':
						if (tree.children[1].token.type !== 'identifier') {
							throw new Error('can only bind to alphanums using let');
						}
						return {
							type: 'let',
							name: tree.children[1].token.value,
							e: buildAst(tree.children[2]),
							body: buildAst(tree.children[3])
						};
					case 'set!':
						if (tree.children[1].token.type !== 'identifier') {
							throw new Error('bindings are referenced by alphanums when using set!');
						}
						return {
							type: 'set!',
							name: tree.children[1].token.value,
							e: buildAst(tree.children[2]),
							body: buildAst(tree.children[3])
						};
					case 'lambda':
						return buildLambda(tree);
					case 'fun':
						return buildFun(tree);
					case 'call/cc':
						return {
							type: 'call/cc',
							callee: buildAst(tree.children[1])
						};
					default:
						return buildCall(tree);
				}
			case 'identifier':
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