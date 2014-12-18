(function () {
	'use strict';

	var tokenizer = window.espace.Tokenizer();

	var number = function (value) {
		return { type: 'number', value: value };
	};

	var binding = function (name) {
		return { type: 'var', name: name };
	};

	var getAst = function (str) {
		var tokens = tokenizer(str);
		var tree = espace.Parser.parse(tokens);
		return cps.buildAst(tree);
	};

	describe('astBuilder', function () {
		beforeEach(function () {
			jasmine.addMatchers(cpsTest.customMatchers);
		});

		it('builds an ast for a number', function () {
			expect(getAst('123')).toEqual(number(123));
		});

		it('builds an ast for a binding', function () {
			expect(getAst('a')).toEqual(binding('a'));
		});

		it('builds an ast for a conditional', function () {
			expect(getAst('(if 123 456 789)')).toEqual({
				type: 'if',
				cond: number(123),
				e1: number(456),
				e2: number(789)
			});
		});

		it('throws an exception when trying to parse an empty paren', function () {
			expect(getAst.bind(null, '()')).toThrowWithMessage('Unexpected empty ()');
		});

		it('throws an exception when trying to parse a bad conditional', function () {
			expect(getAst.bind(null, '(if)')).toThrowWithMessage('if special form admits 3 parameters');
		});

		describe('lambda', function () {
			it('builds an ast for an anonymous function with one parameter', function () {
				expect(getAst('(lambda (x) 123)')).toEqual({
					type: 'lambda',
					param: 'x',
					body: number(123)
				});
			});

			it('builds an ast for an anonymous function with more parameters', function () {
				expect(getAst('(lambda (x y) 123)')).toEqual({
					type: 'lambda',
					param: 'x',
					body: {
						type: 'lambda',
						param: 'y',
						body: number(123)
					}
				});
			});

			it('throws an error if parameter list is missing', function () {
				expect(function () {
					getAst('(lambda x 123)');
				}).toThrowWithMessage('missing parameter list for anonymous function');
			});
		});

		describe('fun', function () {
			it('builds an ast for a function with one parameter', function () {
				expect(getAst('(fun f (x) 123)')).toEqual({
					type: 'fun',
					name: 'f',
					param: 'x',
					body: number(123)
				});
			});

			it('builds an ast for a function with more parameters', function () {
				expect(getAst('(fun f (x y) 123)')).toEqual({
					type: 'fun',
					name: 'f',
					param: 'x',
					body: {
						type: 'lambda',
						param: 'y',
						body: number(123)
					}
				});
			});

			it('throws an error if parameter list is missing', function () {
				expect(function () {
					getAst('(fun f x 123)');
				}).toThrowWithMessage('missing parameter list for function');
			});
		});
	});
})();