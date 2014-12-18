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

	describe('ev', function () {
		beforeEach(function () {
			jasmine.addMatchers(cpsTest.customMatchers);
		});

		cpsTest.subspecs.base(ev);
	});
})();