(function () {
	'use strict';

	var subs = {
		'$+': 2,
		'$-': 2,
		'if': 3,
		'let': 2,
		'set!': 3,
		'lambda': 2,
		'fun': 3,
		'call/cc': 1
	};

	function makeNode(type, properties) {
		return function () {
			var node = {
				type: type
			};
			var args = arguments;
			properties.forEach(function (property, index) {
				node[property] = args[index];
			});
			return node;
		}
	}

	var $call = makeNode('call', ['callee', 'param']);
	var $callCC = makeNode('call/cc', ['callee']);
	var $lambda = makeNode('lambda', ['param', 'body']);
	var $fun = makeNode('fun', ['name', 'param', 'body']);
	var $let = makeNode('let', ['name', 'e', 'body']);
	var $if = makeNode('if', ['cond', 'e1', 'e2']);
	var $add = makeNode('+', ['e1', 'e2']);
	var $sub = makeNode('-', ['e1', 'e2']);
	var $set = makeNode('set!', ['name', 'e', 'body']);
	var $var = makeNode('var', ['name']);
	var $number = makeNode('number', ['value']);

	function buildCall(call) {
		// (call (call (call callee x) y) z)
		// (callee x y z)
		var ret = buildAst(call.children[0]);
		for (var i = 1; i < call.children.length; i++) {
			ret = $call(ret, buildAst(call.children[i]));
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

			ret = $lambda(params[i].token.value, ret);
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

			ret = $lambda(params[i].token.value, ret);
		}

		return $fun(
			fun.children[1].token.value,
			params[i].token.value,
			ret
		);
	}

	function buildLet(let_) {
		// (let x 123 (let y 456 789))
		// (let ((x 123) (y 456)) 789)
		if (let_.children[1].token.type !== '(') {
			throw new Error('missing binding list for let expression');
		}

		var list = let_.children[1].children;

		if (list.length < 1) {
			throw new Error('binding list must contain at least 1 binding');
		}

		list.forEach(function (pair) {
			if (pair.token.type !== '(') {
				throw new Error('binding list items are pairs of an identifier and an expression');
			}

			if (pair.children.length !== 2) {
				throw new Error('binding list items must have 2 members, an identifier and an expression');
			}

			if (pair.children[0].token.type !== 'identifier') {
				throw new Error('cannot bind to non-identifiers');
			}
		});

		var ret = buildAst(let_.children[2]);
		for (var i = list.length - 1; i >= 0; i--) {
			var pair = list[i];
			ret = $let(
				pair.children[0].token.value,
				buildAst(pair.children[1]),
				ret
			);
		}

		return ret;
	}

	function buildAst(tree) {
		switch (tree.token.type) {
			case 'number':
				return $number(tree.token.value);
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
						return $if(
							buildAst(tree.children[1]),
							buildAst(tree.children[2]),
							buildAst(tree.children[3])
						);
					case '$+': // used for debugging only
						return $add(
							buildAst(tree.children[1]),
							buildAst(tree.children[2])
						);
					case '$-': // used for debugging only
						return $sub(
							buildAst(tree.children[1]),
							buildAst(tree.children[2])
						);
					case 'let':
						return buildLet(tree);
					case 'set!':
						if (tree.children[1].token.type !== 'identifier') {
							throw new Error('bindings are referenced by identifiers when using set!');
						}
						return $set(
							tree.children[1].token.value,
							buildAst(tree.children[2]),
							buildAst(tree.children[3])
						);
					case 'lambda':
						return buildLambda(tree);
					case 'fun':
						return buildFun(tree);
					case 'call/cc':
						return $callCC(buildAst(tree.children[1]));
					default:
						return buildCall(tree);
				}
			case 'identifier':
				return $var(tree.token.value);
			default:
				console.warn('Token type not supported');
		}
	}

	if (!window.cps) { window.cps = {}; }
	window.cps.buildAst = buildAst;
	window.cps.buildNode = {
		$call: $call,
		$callCC: $callCC,
		$lambda: $lambda,
		$fun: $fun,
		$let: $let,
		$if: $if,
		$add: $add,
		$sub: $sub,
		$set: $set,
		$var: $var,
		$number: $number
	};
})();