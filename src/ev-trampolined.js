(function () {
	var Env = window.cps.Env;

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
					return ev(e.calee, env, function (caleeValue) {
						return function () {
							return ev(e.param, env, function (paramValue) {
								if (caleeValue.type === 'cont') {
									caleeValue.cont(paramValue); // not sure
								} else {
									var newEnv = caleeValue.env;

									if (caleeValue.name) {
										var funEntry = { key: caleeValue.name, value: caleeValue };
										newEnv = newEnv.con(funEntry);
									}

									var paramEntry = { key: caleeValue.param, value: paramValue };
									newEnv = newEnv.con(paramEntry);
									return function () {
										return ev(caleeValue.body, newEnv, cont);
									};
								}
							});
						};
					});
				};
				break;
			case 'call/cc':
				return function () {
					return ev(e.calee, env, function (caleeValue) {
						var capturedCont = {
							type: 'cont',
							cont: cont
						};
						var newEntry = { key: caleeValue.param, value: capturedCont };
						var newEnv = env.con(newEntry);
						return function () {
							return ev(caleeValue.body, newEnv, cont);
						};
					});
				};
				break;
			default:
				console.warn('Unsupported special form', e.type);
		}
	}

	function _ev(e, cont) {
		var result = ev(e, Env.EMPTY, cont || function (value) {
			console.log(value);
		});

		while (result instanceof Function) {
			result = result();
		}
	}

	if (!window.cps) { window.cps = {}; }
	window.cps.evT = _ev;
})();