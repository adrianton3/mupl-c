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

		it('(if 1 10 20)', function () {
			expect(tr('(if 1 10 20)')).toEqual(10);
		});

		it('(if 0 10 20)', function () {
			expect(tr('(if 0 10 20)')).toEqual(20);
		});

		it('(if 1 ($+ 1 10) 20)', function () {
			expect(tr('(if 1 ($+ 1 10) 20)')).toEqual(11);
		});

		it('($+ 1 (if 1 10 20))', function () {
			expect(tr('($+ 1 (if 1 10 20))')).toEqual(11);
		});

		it('(if ($+ 0 1) 10 20)', function () {
			expect(tr('(if ($+ 0 1) 10 20)')).toEqual(10);
		});

		it('(if ($+ 0 0) 10 20)', function () {
			expect(tr('(if ($+ 0 0) 10 20)')).toEqual(20);
		});

		it('(let ((a 123)) a)', function () {
			expect(tr('(let ((a 123)) a)')).toEqual(123);
		});

		it('(let ((a 123) (a 456)) a)', function () {
			expect(tr('(let ((a 123) (a 456)) a)')).toEqual(456);
		});

		it('(let ((a 123) (b a)) b)', function () {
			expect(tr('(let ((a 123) (b a)) b)')).toEqual(123);
		});

		it('($+ 123 (let ((a 456)) a))', function () {
			expect(tr('($+ 123 (let ((a 456)) a))')).toEqual(123 + 456);
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

		it('((fun f (a) a) 1)', function () {
			expect(tr('((fun f (a) a) 1)')).toEqual(1);
		});

		it('((fun f (a) (if a (f 0) 123)) 1)', function () {
			expect(tr('((fun f (a) (if a (f 0) 123)) 1)')).toEqual(123);
		});

		it('(call/cc (lambda (a) (a 1)))', function () {
			expect(tr('(call/cc (lambda (a) (a 1)))')).toEqual(1);
		});

		it('($+ 1 (call/cc (lambda (a) (call a 10))))', function () {
			expect(tr('($+ 1 (call/cc (lambda (a) (a 10))))')).toEqual(11);
		});

		it('evaluates a complex program', function () {
			expect(tr('((fun sum (n) ' +
			'	(if n ' +
			'		($+ n (sum ($- n 1)))' +
			'		0))' +
			'10)')).toEqual(55);
		});
	});
})();