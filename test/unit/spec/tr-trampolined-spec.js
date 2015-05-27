(function () {
	'use strict';

	var tokenizer = window.espace.Tokenizer();

	var tr = function (str) {
		var tokens = tokenizer(str);
		var tree = espace.Parser.parse(tokens);
		var ast = cps.buildAst(tree);
		var source = window.cps.trTrampolined(ast);
		return new Function(source)();
	};

	describe('tr trampolined', function () {
		beforeEach(function () {
			jasmine.addMatchers(cpsTest.customMatchers);
		});

		cpsTest.subspecs.trBase(tr);

		it('has no bound for the call stack', function () {
			expect(tr('((fun count (n) ' +
				'	(if n ' +
				'		(count ($- n 1)) ' +
				'		567)) ' +
				'20000)'
			)).toEqual(567);
		})
	});
})();