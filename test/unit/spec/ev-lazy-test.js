(function () {
	'use strict';

	var tokenizer = window.espace.Tokenizer();

	var ev = function (str, callback) {
		var tokens = tokenizer(str);
		var tree = espace.Parser.parse(tokens);
		var ast = cps.buildAst(tree);
		window.cps.evLT(ast, callback);
	};

	var getBundle = function () {
		var bundle = {};
		bundle.data = null;
		bundle.calls = 0;
		bundle.callback = function (data) { bundle.data = data; bundle.calls++; };
		return bundle;
	};

	describe('ev-lazy', function () {
		var bundle;
		beforeEach(function () {
			bundle = getBundle();
		});

		it('evaluates a number', function () {
			ev('123', bundle.callback);
			expect(bundle.data).toEqual(123);
		});

		it('evaluates a sum', function () {
			ev('(+ 123 456)', bundle.callback);
			expect(bundle.data).toEqual(123 + 456);
		});

		it('evaluates a conditional', function () {
			ev('(if 1 123 456)', bundle.callback);
			expect(bundle.data).toEqual(123);

			ev('(if 0 123 456)', bundle.callback);
			expect(bundle.data).toEqual(456);
		});

		it('creates a binding an retrieves it', function () {
			ev('(let a 123 a)', bundle.callback);
			expect(bundle.data).toEqual(123);
		});

		it('creates nested bindings an retrieves them', function () {
			ev('(let a 123 (let b 456 (+ a b)))', bundle.callback);
			expect(bundle.data).toEqual(123 + 456);
		});

		it('cannot retrieve shadowed bindings', function () {
			ev('(let a 123 (let a 456 a))', bundle.callback);
			expect(bundle.data).toEqual(456);
		});

		it('can mutate a binding', function () {
			ev('(let a 123 (set! a 456 a))', bundle.callback);
			expect(bundle.data).toEqual(456);
		});

		it('calls a function', function () {
			ev('((lambda (a) a) 123)', bundle.callback);
			expect(bundle.data).toEqual(123);
		});

		it('calls a nested function', function () {
			ev('((lambda (a b) (+ a b)) 123 456)', bundle.callback);
			expect(bundle.data).toEqual(123 + 456);
		});

		it('passes + around', function () {
			ev('((lambda (op a b) (op a b)) + 123 456)', bundle.callback);
			expect(bundle.data).toEqual(123 + 456);
		});

		it('calls with the current continuation', function () {
			ev('(call/cc (lambda (a) (a 123)))', bundle.callback);
			expect(bundle.data).toEqual(123);
		});

		it('evaluates a complex program', function () {
			ev('((fun sum (n) ' +
				'	(if n ' +
				'		(+ n (sum (- n 1))) ' +
				'		0)) ' +
				'10)', bundle.callback);
			expect(bundle.data).toEqual(55);
		});

		it('has no bound for the call stack', function () {
			ev('((fun count (n) ' +
				'	(if n ' +
				'		(count (- n 1))' +
				'		567))' +
				'20000)', bundle.callback);
			expect(bundle.data).toEqual(567);
		});

		it('evaluates a complex call/cc program', function () {
			ev('(let return 0 ' +
				'	(+ 1 (call/cc' +
				'		(lambda (cont)' +
				'			(set! return cont ' +
				'				(return 123))))))', bundle.callback);
			expect(bundle.data).toEqual(124);
		});

		it('evaluates bindings lazily', function () {
			ev('(let infinite ' +
				'	((fun inf (n) (inf 0)) 0) ' +
				'123)', bundle.callback);
			expect(bundle.data).toEqual(123);
		});

		it('evaluates function parameters lazily', function () {
			ev('((lambda (trap) 123) ' +
				'	((fun inf (n) (inf 0)) 0))', bundle.callback);
			expect(bundle.data).toEqual(123);
		});

		it('evaluates a complex program using myif', function () {
			ev('(let myif (lambda (cond then else) (if cond then else)) ' +
				'((fun sum (n) ' +
				'	((myif n (+ n (sum (- n 1)))) 0)) ' +
				'10))', bundle.callback);
			expect(bundle.data).toEqual(55);
		});
	});
})();