(function () {
	'use strict';

	var tokenizer = window.espace.Tokenizer();

	var ev = function (str) {
		var tokens = tokenizer(str);
		var tree = espace.Parser.parse(tokens);
		var ast = cps.buildAst(tree);
		var cont0 = jasmine.createSpy('cont0');
		window.cps.evLT(ast, cont0);
		return cont0;
	};

	describe('ev-trampolined-lazy', function () {
		beforeEach(function () {
			jasmine.addMatchers(cpsTest.customMatchers);
		});

		cpsTest.subspecs.base(ev);

		it('has no bound for the call stack', function () {
			var cont0 = ev('((fun count (n) ' +
				'	(if n ' +
				'		(count (- n 1)) ' +
				'		567)) ' +
				'20000)');
			expect(cont0).toHaveBeenCalledWith(567);
		});

		it('evaluates bindings lazily', function () {
			var cont0 = ev('(let ((infinite ' +
				'	((fun inf (n) (inf 0)) 0))) ' +
				'123)');
			expect(cont0).toHaveBeenCalledWith(123);
		});

		it('evaluates function parameters lazily', function () {
			var cont0 = ev('((lambda (trap) 123) ' +
				'	((fun inf (n) (inf 0)) 0))');
			expect(cont0).toHaveBeenCalledWith(123);
		});

		it('evaluates a complex program using myif', function () {
			var cont0 = ev('(let ((myif (lambda (cond then else) (if cond then else)))) ' +
				'((fun sum (n) ' +
				'	((myif n (+ n (sum (- n 1)))) 0)) ' +
				'10))');
			expect(cont0).toHaveBeenCalledWith(55);
		});
	});
})();