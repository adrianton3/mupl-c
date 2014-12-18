(function () {
	'use strict';

	var tokenizer = window.espace.Tokenizer();

	var ev = function (str) {
		var tokens = tokenizer(str);
		var tree = espace.Parser.parse(tokens);
		var ast = cps.buildAst(tree);
		var cont0 = jasmine.createSpy('cont0');
		window.cps.evT(ast, cont0);
		return cont0;
	};

	describe('ev-trampolined', function () {
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
	});
})();