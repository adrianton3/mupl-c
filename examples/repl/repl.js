(function () {
	'use strict';

	var inTextarea = document.getElementById('in');
	var outTextarea = document.getElementById('out');
	var statusDiv = document.getElementById('status');

	var failed;
	function ok() {
		if (failed) {
			statusDiv.classList.remove('err');
			statusDiv.innerText = '...';
		}
		failed = false;
	}

	function err(e) {
		if (!failed) { statusDiv.classList.add('err'); }
		statusDiv.innerText = e;

		failed = true;
	}

	var ast;
	var tokenizer = espace.Tokenizer();

	function getAst(inText) {
		if (!inText || inText.length === 0) {
			ok();
			return null;
		}

		try {
			var tokens = tokenizer(inText);
			var tree = espace.Parser.parse(tokens);
			var tmpAst = cps.buildAst(tree);
			ok();
		} catch (ex) {
			err(ex);
		}

		return tmpAst;
	}

	function doEval() {
		try {
			var result;
			cps.evT(ast, function (_result) { result = _result; });
			outTextarea.value = outTextarea.value + '> ' + result + '\n\n';
		} catch (ex) {
			outTextarea.value = outTextarea.value + ex + '\n\n';
		}

		inTextarea.value = '';
	}

	inTextarea.addEventListener('keyup', function (ev) {
		if (ev.which === 13 && !ev.shiftKey) {
			if (!ast) { ast = getAst(this.value); }
			doEval();
		} else {
			ast = getAst(this.value);
		}
	});
})();