(function () {
	'use strict';

	var EMPTY = cps.Env.EMPTY;
	var entry = function (key, value) { return { key: key, value: value }; };
	var buildEnv = function (array) {
		var env = EMPTY;
		array.forEach(function (elem) {
			env = env.con(elem);
		});
		return env;
	};

	describe('env', function () {
		it('cannot lookup in an empty environment', function () {
			expect(function () { EMPTY.find('a'); }).toThrow(new Error('Entry with key a could not be found'));
		});

		it('throws an exception when trying to find a non-existent entry', function () {
			var env = buildEnv([entry('a', 10), entry('b', 20), entry('c', 30)]);
			expect(function () { EMPTY.find('d'); }).toThrow(new Error('Entry with key d could not be found'));
		});

		it('can attach and retrieve an entry', function () {
			var env = buildEnv([entry('a', 10)]);
			expect(env.find('a')).toEqual(10);
		});

		it('can attach multiple entries and retrieve the correct one', function () {
			var env = buildEnv([entry('a', 10), entry('b', 20), entry('c', 30)]);
			expect(env.find('b')).toEqual(20);
			expect(env.find('a')).toEqual(10);
			expect(env.find('c')).toEqual(30);
		});

		it('can attach multiple entries and retrieve the correct one', function () {
			var env = buildEnv([entry('a', 10), entry('a', 20), entry('a', 30)]);
			expect(env.find('a')).toEqual(30);
		});

		it('can attach multiple entries and retrieve the correct one', function () {
			var envBase = EMPTY.con(entry('a', 10));
			var envDer1 = envBase.con(entry('b', 20));
			var envDer2 = envBase.con(entry('c', 30));

			expect(envBase.find('a')).toEqual(10);
			expect(envDer1.find('a')).toEqual(10);
			expect(envDer2.find('a')).toEqual(10);
			expect(envDer1.find('b')).toEqual(20);
			expect(envDer2.find('c')).toEqual(30);
		});

		it('can mutate the value of an entry', function () {
			var env = buildEnv([entry('a', 10), entry('b', 20), entry('c', 30)]);
			env.set('b', 40);
			expect(env.find('a')).toEqual(10);
			expect(env.find('b')).toEqual(40);
			expect(env.find('c')).toEqual(30);
		});

		it('throws an exception when trying to mutate a non-existent entry', function () {
			var env = buildEnv([entry('a', 10), entry('b', 20), entry('c', 30)]);
			expect(function () { env.set('d', 40); }).toThrow(new Error('Entry with key d could not be found'));
		});
	});
})();