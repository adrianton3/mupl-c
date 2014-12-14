(function () {
    'use strict';

    var Env = window.cps.Env;

    var prelude = Env.EMPTY;

    var getBinaryOp = function (op) {
        return {
            key: op,
            value: {
            type: 'closure',
                env: Env.EMPTY,
                param: 'a',
                body: {
                    type: 'lambda',
                    param: 'b',
                    body: {
                        type: op,
                        e1: {
                            type: 'var',
                            name: 'a'
                        },
                        e2: {
                            type: 'var',
                            name: 'b'
                        }
                    }
                }
            }
        };
    };

    prelude = prelude.con(getBinaryOp('-'));
    prelude = prelude.con(getBinaryOp('+'));

    if (!window.cps) { window.cps = {}; }
    window.cps.prelude = prelude;
})();