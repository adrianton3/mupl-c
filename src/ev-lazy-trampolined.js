(function () {
	"use strict";

	var Env = window.cps.Env;

	function delay(computation) {
		return {
			type: 'thunk',
			value: null,
			computed: false,
			computation: computation
		};
	}

	function force(thunk) {
		if (thunk.type !== 'thunk') {
			return thunk;
		}

		if (thunk.computed) {
			return thunk.value;
		}

		var value;
		var catcher = function (value_) {
			value = value_;
		};
		thunk.computation(catcher);

		while (value.type === 'thunk') {
			value.computation(catcher);
		}
		thunk.computed = true;
		thunk.value = value;
		return value;
	}

	function ev(e, env, cont) {
		switch (e.type) {
			case 'number':
				return cont(e.value);
				break;
			case 'var':
				return cont(force(env.find(e.name)));
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
					var newEntry = {
						key: e.name,
						value: delay(function (store) {
							var tmp = ev(e.e, env, store);
							while (tmp instanceof Function) {
								tmp = tmp();
							}
						})
					};
					var newEnv = env.con(newEntry);
					return function () {
						return ev(e.body, newEnv, cont);
					};
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
						if (caleeValue.type === 'cont') {
							return function () {
								return ev(e.param, env, function (paramValue) {
									caleeValue.cont(paramValue); // not sure
								});
							};
						} else {
							var newEnv = caleeValue.env;

							if (caleeValue.name) {
								var funEntry = { key: caleeValue.name, value: caleeValue };
								newEnv = newEnv.con(funEntry);
							}

							var paramEntry = {
								key: caleeValue.param,
								value: delay(function (store) {
									var tmp = ev(e.param, env, store);
									while (tmp instanceof Function) {
										tmp = tmp();
									}
								})
							};
							newEnv = newEnv.con(paramEntry);
							return function () {
								return ev(caleeValue.body, newEnv, cont);
							};
						}
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
		cont = cont || function (value) { console.log(value); };

		var result = ev(e, Env.EMPTY, function (value) {
			cont(force(value));
		});

		var counter = 0;
		while (result instanceof Function) {
			result = result();

			counter++;
			if (counter > 1000000) {
				throw new Error('The executing script appears to be non-responding');
			}
		}
	}

	if (!window.cps) { window.cps = {}; }
	window.cps.evLT = _ev;
})();