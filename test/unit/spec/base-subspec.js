(function () {
    'use strict';

    var base = function (ev) {
        it('evaluates a number', function () {
            var cont0 = ev('123');
            expect(cont0).toHaveBeenCalledWith(123);
        });

        it('evaluates a sum', function () {
            var cont0 = ev('(+ 123 456)');
            expect(cont0).toHaveBeenCalledWith(123 + 456);
        });

        it('evaluates a nested sum', function () {
            var cont0 = ev('(+ (+ 12 34) (+ 56 78))');
            expect(cont0).toHaveBeenCalledWith(12 + 34 + 56 + 78);
        });

        it('cannot add non-numbers', function () {
            function thunk() { ev('(+ (lambda (a) a) 456)'); }
            expect(thunk).toThrowWithMessage('cannot add non-numbers');
        });

        it('evaluates a subtraction', function () {
            var cont0 = ev('(- 123 456)');
            expect(cont0).toHaveBeenCalledWith(123 - 456);
        });

        it('cannot subtract non-numbers', function () {
            function thunk() { ev('(- 123 (lambda (a) a))'); }
            expect(thunk).toThrowWithMessage('cannot subtract non-numbers');
        });

        it('evaluates a conditional', function () {
            var cont01 = ev('(if 1 123 456)');
            expect(cont01).toHaveBeenCalledWith(123);

            var cont02 = ev('(if 0 123 456)');
            expect(cont02).toHaveBeenCalledWith(456);
        });

        it('creates a binding an retrieves it', function () {
            var cont0 = ev('(let a 123 a)');
            expect(cont0).toHaveBeenCalledWith(123);
        });

        it('creates nested bindings an retrieves them', function () {
            var cont0 = ev('(let a 123 (let b 456 (+ a b)))');
            expect(cont0).toHaveBeenCalledWith(123 + 456);
        });

        it('cannot retrieve shadowed bindings', function () {
            var cont0 = ev('(let a 123 (let a 456 a))');
            expect(cont0).toHaveBeenCalledWith(456);
        });

        it('can mutate a binding', function () {
            var cont0 = ev('(let a 123 (set! a 456 a))');
            expect(cont0).toHaveBeenCalledWith(456);
        });

        it('calls a function', function () {
            var cont0 = ev('((lambda (a) a) 123)');
            expect(cont0).toHaveBeenCalledWith(123);
        });

        it('cannot call a non-function', function () {
            function thunk() { ev('(123 456)'); }
            expect(thunk).toThrowWithMessage('cannot call non-function');
        });

        it('calls a nested function', function () {
            var cont0 = ev('((lambda (a b) (+ a b)) 123 456)');
            expect(cont0).toHaveBeenCalledWith(123 + 456);
        });

        it('passes + around', function () {
            var cont0 = ev('((lambda (op a b) (op a b)) + 123 456)');
            expect(cont0).toHaveBeenCalledWith(123 + 456);
        });

        it('calls with the current continuation', function () {
            var cont0 = ev('(call/cc (lambda (a) (a 123)))');
            expect(cont0).toHaveBeenCalledWith(123);
        });

        it('evaluates a complex program', function () {
            var cont0 = ev('((fun sum (n) ' +
            '	(if n ' +
            '		(+ n (sum (- n 1)))' +
            '		0))' +
            '10)');
            expect(cont0).toHaveBeenCalledWith(55);
        });

        it('has no bound for the call stack', function () {
            var cont0 = ev('((fun count (n) ' +
            '	(if n ' +
            '		(count (- n 1)) ' +
            '		567)) ' +
            '20000)');
            expect(cont0).toHaveBeenCalledWith(567);
        });

        it('evaluates a complex call/cc program', function () {
            var cont0 = ev('(let return 0 ' +
            '	(+ 1 (call/cc ' +
            '		(lambda (cont) ' +
            '			(set! return cont ' +
            '				(return 123))))))');
            expect(cont0).toHaveBeenCalledWith(124);
        });
    };

    window.cpsTest = window.cpsTest || {};
    window.cpsTest.subspecs = window.cpsTest.subspecs || {};
    window.cpsTest.subspecs.base = base;
})();