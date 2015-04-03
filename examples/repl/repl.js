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
		outTextarea.scrollTop = outTextarea.scrollHeight;

		inTextarea.value = '';
	}

	var history = (function () {
		var log = [];
		var cursor = 0;

		function add(expression) {
			log.push(expression);
			if (log.length > 1000) {
				log.shift();
			}
			cursor = log.length;
		}

		function up() {
			if (cursor > 0) { cursor--; }
			inTextarea.value = log[cursor] || '';
		}

		function down() {
			if (cursor < log.length - 1) { cursor++; }
			inTextarea.value = log[cursor] || '';
		}

		return {
			up: up,
			down: down,
			add: add
		}
	})();

	inTextarea.addEventListener('keydown', function (ev) {
		if (ev.which === 13 && !ev.shiftKey) {
			if (!ast) {
				ast = getAst(this.value);
			}
			history.add(this.value);
			doEval();
			ev.preventDefault();
		} else if (ev.which === 38 && ev.ctrlKey) {
			history.up();
			ev.preventDefault();
		} else if (ev.which === 40 && ev.ctrlKey) {
			history.down();
			ev.preventDefault();
		} else {
			ast = getAst(this.value);
		}
	});

	inTextarea.addEventListener('keyup', function (ev) {
		ast = getAst(this.value);
	});
})();