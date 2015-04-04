(function () {
	'use strict';

	function tr(e, cont, level) {
		switch (e.type) {
			case 'number':
				return cont + "(" + e.value + ")";
			case 'var':
				return cont + "(" + e.name + ")";
			case 'if':
				return tr(e.cond, "(function (condValue_" + level + ") {" +
					"if (condValue_" + level + ") {" +
						tr(e.e1, cont, level + 1) +
					"} else {" +
						tr(e.e2, cont, level + 1) +
					"}" +
				"})");
			case '+':
				return tr(e.e1, "(function (e1Value_" + level + ") {" +
					tr(e.e2, "(function (e2Value_" + level + ") {" +
						cont + "(e1Value_" + level + " + e2Value_" + level + ")" +
					"})", level + 1) +
				"})", level + 1);
			case '-':
				return tr(e.e1, "(function (e1Value_" + level + ") {" +
					tr(e.e2, "(function (e2Value_" + level + ") {" +
						cont + "(e1Value_" + level + " - e2Value_" + level + ")" +
					"})", level + 1) +
				"})", level + 1);
			case 'let':
				return tr(e.e, "(function (eValue_" + level + ") {" +
					"(function (" + e.name + ") {" +
						tr(e.body, cont, level + 1) +
					"})(eValue_" + level + ")" +
				"})");
			case 'set!':
				return tr(e.e, "(function (eValue_" + level + ") {" +
					e.name + " = eValue_" + level + ";" +
					tr(e.body, cont, level + 1) +
				"})");
			case 'lambda':
				return cont + "({" +
					"type: 'closure'," +
					"body: (function (" + e.param + ", cont) { " + tr(e.body, 'cont', level + 1) + " })" +
				"})";
			case 'fun':
				return cont + "((function () {" +
					"var " + e.name + " = {" +
						"type: 'closure'," +
						"body: (function (" + e.param + ", cont) { " + tr(e.body, 'cont', level + 1) + " })" +
					"};" +
					"return " + e.name + ";" +
				"})())";
			case 'call':
				return tr(e.callee, "(function (calleeValue_" + level + ") {" +
					tr(e.param, "(function (paramValue_" + level + ") {" +
						"if (calleeValue_" + level + ".type === 'cont') {" +
							"calleeValue_" + level + ".cont(paramValue_" + level + ");" +
						"} else if (calleeValue_" + level + ".type === 'closure') {" +
							"calleeValue_" + level + ".body(paramValue_" + level + ", function (value) {" + cont + "(value); })" +
						"}" +
					"})", level + 1) +
				"})", level + 1);
			case 'call/cc':
				return tr(e.callee, "(function (calleeValue_" + level + ") {" +
					"var capturedCont = {" +
						"type: 'cont'," +
						"cont: function (value) {" + cont + "(value); }" +
					"};" +
					"calleeValue_" + level + ".body(capturedCont)" +
				"})", level + 1);
			default:
				console.warn('Unsupported special form', e.type);
		}
	}

	function _tr(e) {
		return "'use strict'; " +
			"var _evResult;" +
			tr(e, "_evResult = ", 0) + ";" +
			"return _evResult;";
	}

	if (!window.cps) { window.cps = {}; }
	window.cps.tr = _tr;
})();