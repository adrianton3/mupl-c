(function () {
	'use strict';

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
		console.log(e.coords);
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

	function setupEditors(options) {
		var inEditor = ace.edit('in-editor');
		inEditor.setTheme('ace/theme/github');
		inEditor.setFontSize(options.fontSize);
		inEditor.on('input', options.onInput);

		var outEditor = ace.edit('out-editor');
		outEditor.setTheme('ace/theme/github');
		outEditor.getSession().setMode('ace/mode/javascript');
		outEditor.setFontSize(options.fontSize);
		outEditor.setReadOnly(true);
		outEditor.$blockScrolling = Infinity;

		return {
			inEditor: inEditor,
			outEditor: outEditor
		};
	}

	var editors = setupEditors({
		fontSize: 16,
		onInput: function () {
			var code = editors.inEditor.getValue();
			var ast = getAst(code);
			if (ast) {
				var rawJs = cps.trT(ast);
				var prettyJs = js_beautify(rawJs, { indent_size: 2 });
				editors.outEditor.setValue(prettyJs, -1);
			}
		}
	});

	editors.inEditor.setValue('(if 1 2 3)', 1);
})();