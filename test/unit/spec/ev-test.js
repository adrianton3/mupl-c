(function () {
	'use strict';

	var tokenizer = window.espace.Tokenizer();

	var ev = function (str, callback) {
		var tokens = tokenizer(str);
		var tree = espace.Parser.parse(tokens);
		var ast = cps.buildAst(tree);
		window.cps.evT(ast, callback);
	};

	describe('ev', function () {
		var cont0;

		beforeEach(function () {
			jasmine.addMatchers(cpsTest.customMatchers);
			cont0 = jasmine.createSpy('cont0');
		});

		it('evaluates a number', function () {
			ev('123', cont0);
			expect(cont0).toHaveBeenCalledWith(123);
		});

		it('evaluates a sum', function () {
			ev('(+ 123 456)', cont0);
			expect(cont0).toHaveBeenCalledWith(123 + 456);
		});

		it('evaluates a nested sum', function () {
			ev('(+ (+ 12 34) (+ 56 78))', cont0);
			expect(cont0).toHaveBeenCalledWith(12 + 34 + 56 + 78);
		});

		it('cannot add non-numbers', function () {
			function thunk() { ev('(+ (lambda (a) a) 456)', cont0); }
			expect(thunk).toThrowWithMessage('cannot add non-numbers');
		});

		it('evaluates a subtraction', function () {
			ev('(- 123 456)', cont0);
			expect(cont0).toHaveBeenCalledWith(123 - 456);
		});

		it('cannot subtract non-numbers', function () {
			function thunk() { ev('(- 123 (lambda (a) a))', cont0); }
			expect(thunk).toThrowWithMessage('cannot subtract non-numbers');
		});

		it('evaluates a conditional', function () {
			ev('(if 1 123 456)', cont0);
			expect(cont0).toHaveBeenCalledWith(123);

			ev('(if 0 123 456)', cont0);
			expect(cont0).toHaveBeenCalledWith(456);
		});

		it('creates a binding an retrieves it', function () {
			ev('(let a 123 a)', cont0);
			expect(cont0).toHaveBeenCalledWith(123);
		});

		it('creates nested bindings an retrieves them', function () {
			ev('(let a 123 (let b 456 (+ a b)))', cont0);
			expect(cont0).toHaveBeenCalledWith(123 + 456);
		});

		it('cannot retrieve shadowed bindings', function () {
			ev('(let a 123 (let a 456 a))', cont0);
			expect(cont0).toHaveBeenCalledWith(456);
		});

		it('can mutate a binding', function () {
			ev('(let a 123 (set! a 456 a))', cont0);
			expect(cont0).toHaveBeenCalledWith(456);
		});

		it('calls a function', function () {
			ev('((lambda (a) a) 123)', cont0);
			expect(cont0).toHaveBeenCalledWith(123);
		});

		it('cannot call a non-function', function () {
			function thunk() { ev('(123 456)', cont0); }
			expect(thunk).toThrowWithMessage('cannot call non-function');
		});

		it('calls a nested function', function () {
			ev('((lambda (a b) (+ a b)) 123 456)', cont0);
			expect(cont0).toHaveBeenCalledWith(123 + 456);
		});

		it('passes + around', function () {
			ev('((lambda (op a b) (op a b)) + 123 456)', cont0);
			expect(cont0).toHaveBeenCalledWith(123 + 456);
		});

		it('calls with the current continuation', function () {
			ev('(call/cc (lambda (a) (a 123)))', cont0);
			expect(cont0).toHaveBeenCalledWith(123);
		});

		it('evaluates a complex program', function () {
			ev('((fun sum (n) ' +
				'	(if n ' +
				'		(+ n (sum (- n 1)))' +
				'		0))' +
				'10)', cont0);
			expect(cont0).toHaveBeenCalledWith(55);
		});

		it('has no bound for the call stack', function () {
			ev('((fun count (n) ' +
				'	(if n ' +
				'		(count (- n 1)) ' +
				'		567)) ' +
				'2)', cont0);
			expect(cont0).toHaveBeenCalledWith(567);
		});

		it('evaluates a complex call/cc program', function () {
			ev('(let return 0 ' +
				'	(+ 1 (call/cc ' +
				'		(lambda (cont) ' +
				'			(set! return cont ' +
				'				(return 123))))))', cont0);
			expect(cont0).toHaveBeenCalledWith(124);
		});
	});
})();