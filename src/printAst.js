(function () {
	function printAst(ast) {
		switch (ast.type) {
			case 'number':
				return ast.name;
			case 'var':
				return ast.value;
			case 'if':
				return '(if ' + printAst(ast.cond) + ' ' + printAst(ast.e1) + ' ' + printAst(ast.e2) + ')';
			case '+':
				return '(+ ' + printAst(ast.e1) + ' ' + printAst(ast.e2) + ')';
			case '-':
				return '(- ' + printAst(ast.e1) + ' ' + printAst(ast.e2) + ')';
			case 'let':
				return '(let ' + ast.name + ' ' + printAst(ast.e) + ' ' + printAst(ast.body) + ')';
			case 'set!':
				return '(set! ' + ast.name + ' ' + printAst(ast.e) + ' ' + printAst(ast.body) + ')';
			case 'lambda':
				return '(lambda ' + ast.param + ' ' + printAst(ast.body) + ')';
			case 'fun':
				return '(fun ' + ast.name + ' ' + ast.param + ' ' + printAst(ast.body) + ')';
			case 'call':
				return '(call ' + printAst(ast.callee) + ' ' + printAst(ast.param) + ')';
			case 'call/cc':
				return '(call/cc ' + printAst(ast.callee) + ')';
		}
	}

	if (!window.cps) { window.cps = {}; }
	window.cps.printAst = printAst;
})();