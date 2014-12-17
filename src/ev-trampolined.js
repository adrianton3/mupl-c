(function () {
	'use strict';

	function ev(e, env, cont) {
		switch (e.type) {
			case 'number':
				return cont(e.value);
				break;
			case 'var':
				return cont(env.find(e.name));
				break;
			case 'if':
				return function () {
					return ev(e.cond, env, function (condValue) {
						if (condValue) {
							return function () {
								return ev(e.e1, env, cont);
							}
						} else {
							return function () {
								return ev(e.e2, env, cont);
							}
						}
					});
				};
				break;
			case '+':
				return function () {
					return ev(e.e1, env, function (e1Value) {
						return function () {
							return ev(e.e2, env, function (e2Value) {
								if (typeof e1Value !== 'number' || typeof e2Value !== 'number') {
									throw new Error('cannot add non-numbers');
								}
								return cont(e1Value + e2Value);
							});
						}
					});
				};
				break;
			case '-':
				return function () {
					return ev(e.e1, env, function (e1Value) {
						return function () {
							return ev(e.e2, env, function (e2Value) {
								if (typeof e1Value !== 'number' || typeof e2Value !== 'number') {
									throw new Error('cannot subtract non-numbers');
								}
								return cont(e1Value - e2Value);
							});
						}
					});
				};
				break;
			case 'let':
				return function () {
					return ev(e.e, env, function (eValue) {
						var newEntry = { key: e.name, value: eValue };
						var newEnv = env.con(newEntry);
						return function () {
							return ev(e.body, newEnv, cont);
						}
					});
				};
				break;
			case 'set!':
				return function () {
					return ev(e.e, env, function (eValue) {
						env.set(e.name, eValue);
						return function () {
							return ev(e.body, env, cont);
						}
					});
				};
				break;
			case 'lambda':
				return cont({
					type: 'closure',
					env: env,
					param: e.param,
					body: e.body
				});
				break;
			case 'fun':
				return cont({
					type: 'closure',
					env: env,
					name: e.name,
					param: e.param,
					body: e.body
				});
				break;
			case 'closure':
				return cont(e);
				break;
			case 'call':
				return function () {
					return ev(e.callee, env, function (calleeValue) {
						return function () {
							return ev(e.param, env, function (paramValue) {
								if (calleeValue.type === 'cont') {
									return calleeValue.cont(paramValue);
								} else if (calleeValue.type === 'closure') {
									var newEnv = calleeValue.env;

									if (calleeValue.name) {
										var funEntry = { key: calleeValue.name, value: calleeValue };
										newEnv = newEnv.con(funEntry);
									}

									var paramEntry = { key: calleeValue.param, value: paramValue };
									newEnv = newEnv.con(paramEntry);
									return function () {
										return ev(calleeValue.body, newEnv, cont);
									};
								} else {
									throw new Error('cannot call non-function');
								}
							});
						};
					});
				};
				break;
			case 'call/cc':
				return function () {
					return ev(e.callee, env, function (calleeValue) {
						var capturedCont = {
							type: 'cont',
							cont: cont
						};
						var newEntry = { key: calleeValue.param, value: capturedCont };
						var newEnv = env.con(newEntry);
						return function () {
							return ev(calleeValue.body, newEnv, cont);
						};
					});
				};
				break;
			default:
				console.warn('Unsupported special form', e.type);
		}
	}

	function _ev(e, cont) {
		var result = ev(e, window.cps.prelude, cont || function (value) {
			console.log(value);
		});

		while (result instanceof Function) {
			result = result();
		}
	}

	if (!window.cps) { window.cps = {}; }
	window.cps.evT = _ev;
})();