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

	inTextarea.addEventListener('keyup', function (ev) {
		var ast = getAst(this.value);
		if (ast) {
			var rawJs = cps.trT(ast);
			var prettyJs = js_beautify(rawJs);
			outTextarea.value = prettyJs;
		}
	});
})();