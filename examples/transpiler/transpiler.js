(function () {
	'use strict';

	function ok() {
		editors.inEditor.getSession().setAnnotations([]);
	}

	function err(ex) {
		var line = ex.coords ? ex.coords.line - 1 : 0;
		editors.inEditor.getSession().setAnnotations([{
			row: line,
			text: ex.message,
			type: 'error'
		}]);
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
		inEditor.setTheme('ace/theme/dawn');
		inEditor.setFontSize(options.fontSize);
		inEditor.on('input', options.onInput);
		inEditor.$blockScrolling = Infinity;

		var outEditor = ace.edit('out-editor');
		outEditor.setTheme('ace/theme/dawn');
		outEditor.getSession().setMode('ace/mode/javascript');
		outEditor.setFontSize(options.fontSize);
		outEditor.setReadOnly(true);
		outEditor.getSession().setUseWorker(false);
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

	window.setupExamples('examples', editors.inEditor);
})();