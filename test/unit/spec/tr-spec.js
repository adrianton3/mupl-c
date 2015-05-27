(function () {
	'use strict';

	var tokenizer = window.espace.Tokenizer();

	var tr = function (str) {
		var tokens = tokenizer(str);
		var tree = espace.Parser.parse(tokens);
		var ast = cps.buildAst(tree);
		var source = window.cps.tr(ast);
		return new Function(source)();
	};

	describe('tr', function () {
		beforeEach(function () {
			jasmine.addMatchers(cpsTest.customMatchers);
		});

		cpsTest.subspecs.trBase(tr);
	});
})();