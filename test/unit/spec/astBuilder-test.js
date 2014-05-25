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
			expect(getAst.bind(null, '()')).toThrow(new Error('Unexpected empty ()'));
		});

		it('throws an exception when trying to parse a bad conditional', function () {
			expect(getAst.bind(null, '(if)')).toThrow(new Error('if special form admits 3 parameters'));
		});

		it('builds an ast for a sum', function () {
			expect(getAst('(+ 123 456)')).toEqual({
				type: '+',
				e1: number(123),
				e2: number(456)
			});
		});

		it('builds an ast for a difference', function () {
			expect(getAst('(- 123 456)')).toEqual({
				type: '-',
				e1: number(123),
				e2: number(456)
			});
		});
	});
})();