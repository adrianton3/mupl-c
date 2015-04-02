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

		it('throws an exception when trying to parse an empty paren', function () {
			expect(getAst.bind(null, '()')).toThrowWithMessage('Unexpected empty ()');
		});

		it('builds an ast for a number', function () {
			expect(getAst('123')).toEqual(number(123));
		});

		it('builds an ast for a binding', function () {
			expect(getAst('a')).toEqual(binding('a'));
		});

		describe('$+ (debug only)', function () {
			it('builds an ast for a raw addition', function () {
				expect(getAst('($+ 123 456)')).toEqual({
					type: '+',
					e1: number(123),
					e2: number(456)
				});
			});

			it('throws an exception when trying to parse a bad raw addition', function () {
				expect(getAst.bind(null, '($+)')).toThrowWithMessage('$+ special form admits 2 parameters');
			});
		});

		describe('$- (debug only)', function () {
			it('builds an ast for a raw addition', function () {
				expect(getAst('($- 123 456)')).toEqual({
					type: '-',
					e1: number(123),
					e2: number(456)
				});
			});

			it('throws an exception when trying to parse a bad raw addition', function () {
				expect(getAst.bind(null, '($-)')).toThrowWithMessage('$- special form admits 2 parameters');
			});
		});

		describe('if', function () {
			it('builds an ast for a conditional', function () {
				expect(getAst('(if 123 456 789)')).toEqual({
					type: 'if',
					cond: number(123),
					e1: number(456),
					e2: number(789)
				});
			});

			it('throws an exception when trying to parse a bad conditional', function () {
				expect(getAst.bind(null, '(if)')).toThrowWithMessage('if special form admits 3 parameters');
			});
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

		describe('let', function () {
			it('builds an ast for a single binding', function () {
				expect(getAst('(let ((x 123)) 456)')).toEqual({
					type: 'let',
					name: 'x',
					e: number(123),
					body: number(456)
				});
			});

			it('builds an ast for more bindings', function () {
				expect(getAst('(let ((x 123) (y 456)) 789)')).toEqual({
					type: 'let',
					name: 'x',
					e: number(123),
					body: {
						type: 'let',
						name: 'y',
						e: number(456),
						body: number(789)
					}
				});
			});

			it('throws an error if binding list is missing', function () {
				expect(function () {
					getAst('(let x 123)');
				}).toThrowWithMessage('missing binding list for let expression');
			});

			it('throws an error if binding list is empty', function () {
				expect(function () {
					getAst('(let () 123)');
				}).toThrowWithMessage('binding list must contain at least 1 binding');
			});

			it('throws an error if binding list items are not pairs', function () {
				expect(function () {
					getAst('(let (x y) 123)');
				}).toThrowWithMessage('binding list items are pairs of an identifier and an expression');
			});

			it('throws an error if binding list items contain more or less than 2 members', function () {
				expect(function () {
					getAst('(let (()) 123)');
				}).toThrowWithMessage('binding list items must have 2 members, an identifier and an expression');

				expect(function () {
					getAst('(let ((x y z)) 123)');
				}).toThrowWithMessage('binding list items must have 2 members, an identifier and an expression');
			});

			it('throws an error if binding list items contain a non-identifier as their first member', function () {
				expect(function () {
					getAst('(let ((123 456)) 123)');
				}).toThrowWithMessage('cannot bind to non-identifiers');
			});
		});
	});
})();