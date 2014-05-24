(function () {
	var Env = window.cps.Env;

	function ev(e, env, cont) {
		switch (e.type) {
			case 'number':
				cont(e.value);
				break;
			case 'var':
				cont(env.find(e.name));
				break;
			case 'if':
				ev(e.cond, env, function (condValue) {
					if (condValue) {
						ev(e.e1, env, cont);
					} else {
						ev(e.e2, env, cont);
					}
				});
				break;
			case '+':
				ev(e.e1, env, function (e1Value) {
					ev(e.e2, env, function (e2Value) {
						cont(e1Value + e2Value);
					});
				});
				break;
			case '-':
				ev(e.e1, env, function (e1Value) {
					ev(e.e2, env, function (e2Value) {
						cont(e1Value - e2Value);
					});
				});
				break;
			case 'let':
				ev(e.e, env, function (eValue) {
					var newEntry = { key: e.name, value: eValue };
					var newEnv = env.con(newEntry);
					ev(e.body, newEnv, cont);
				});
				break;
			case 'set!':
				ev(e.e, env, function (eValue) {
					env.set(e.name, eValue);
					ev(e.body, env, cont);
				});
				break;
			case 'lambda':
				cont({
					type: 'closure',
					env: env,
					param: e.param,
					body: e.body
				});
				break;
			case 'fun':
				cont({
					type: 'closure',
					env: env,
					name: e.name,
					param: e.param,
					body: e.body
				});
				break;
			case 'closure':
				cont(e);
				break;
			case 'call':
				ev(e.calee, env, function (caleeValue) {
					ev(e.param, env, function (paramValue) {
						if (caleeValue instanceof Function) {
							caleeValue(paramValue); // not sure
						} else {
							var newEnv = caleeValue.env;

							if (caleeValue.name) {
								var funEntry = { key: caleeValue.name, value: caleeValue };
								newEnv = newEnv.con(funEntry);
							}

							var paramEntry = { key: caleeValue.param, value: paramValue };
							newEnv = newEnv.con(paramEntry);
							ev(caleeValue.body, newEnv, cont);
						}
					});
				});
				break;
			case 'call/cc':
				ev(e.calee, env, function (caleeValue) {
					var newEntry = { key: caleeValue.param, value: cont };
					var newEnv = env.con(newEntry);
					ev(caleeValue.body, newEnv, cont);
				});
				break;
			default:
				console.warn('Unsupported special form', e.type);
		}
	}

	function _ev(e, cont) {
		ev(e, Env.EMPTY, cont || function (value) {
			console.log(value);
		});
	}

	if (!window.cps) { window.cps = {}; }
	window.cps.ev = _ev;
})();