(function () {
	'use strict';

	var tokenizer = window.espace.Tokenizer();

	var tr = function (str) {
		var tokens = tokenizer(str);
		var tree = espace.Parser.parse(tokens);
		var ast = cps.buildAst(tree);
		var source = window.cps.tr(ast, '');
		console.log(source);
		console.log('===');
		window.z = 0;
		new Function(source)();
		return window.z;
	};

	describe('tr', function () {
		beforeEach(function () {
			jasmine.addMatchers(cpsTest.customMatchers);
		});

		it('123', function () {
			expect(tr('123')).toEqual(123);
		});

		it('($+ 1 10)', function () {
			expect(tr('($+ 1 10)')).toEqual(11);
		});

		it('($+ 1 ($+ 10 100))', function () {
			expect(tr('($+ 1 ($+ 10 100))')).toEqual(111);
		});

		it('((lambda (a) a) 1)', function () {
			expect(tr('((lambda (a) a) 1)')).toEqual(1);
		});

		it('((lambda (a b) ($+ a b)) 1 10)', function () {
			expect(tr('((lambda (a b) ($+ a b)) 1 10)')).toEqual(11);
		});

		it('((lambda (a b c) ($+ ($+ a b) c)) 1 10 100)', function () {
			expect(tr('((lambda (a b c) ($+ ($+ a b) c)) 1 10 100)')).toEqual(111);
		});

		it('(call/cc (lambda (a) (a 1)))', function () {
			expect(tr('(call/cc (lambda (a) (a 1)))')).toEqual(1);
		});

		it('($+ 1 (call/cc (lambda (a) (call a 10))))', function () {
			expect(tr('($+ 1 (call/cc (lambda (a) (a 10))))')).toEqual(11);
		});
	});
})();