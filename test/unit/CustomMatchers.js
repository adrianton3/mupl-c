(function () {
    'use strict';

    var toThrowWithMessage = function (util, customEqualityTesters) {
        return {
            compare: function (actual, expected) {
                var ex, result;
                result = {};
                try {
                    actual();
                    result.pass = false;
                    result.message = 'Expected function to throw an exception';
                } catch (_error) {
                    ex = _error;
                    if (ex.message !== expected) {
                        result.pass = false;
                        result.message = 'Expected function to throw an exception with the message "' + expected + '"' + ' but instead received ' + (ex.message != null ? '"' + ex.message + '"' : 'no message');
                    } else {
                        result.pass = true;
                    }
                }
                return result;
            }
        };
    };

    if (!window.cpsTest) { window.cpsTest = {}; }
    window.cpsTest.customMatchers = {
        toThrowWithMessage: toThrowWithMessage
    }
})();