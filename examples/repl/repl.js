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
		if (!ast) { return; }

		var previous = editors.outEditor.getValue();

		try {
			var result;
			cps.evT(ast, function (_result) { result = _result; });
			editors.outEditor.setValue(previous + '> ' + result + '\n\n', 1);
		} catch (ex) {
			editors.outEditor.setValue(previous + ex + '\n\n', 1);
		}

		editors.outEditor.scrollToLine(
			editors.outEditor.getSession().getLength()
		);

		editors.inEditor.setValue('', 1);
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
			editors.inEditor.setValue(log[cursor] || '', 1);
		}

		function down() {
			if (cursor < log.length - 1) { cursor++; }
			editors.inEditor.setValue(log[cursor] || '', 1);
		}

		return {
			up: up,
			down: down,
			add: add
		}
	})();

	function setupEditors(options) {
		var inEditor = ace.edit('in-editor');
		inEditor.setTheme('ace/theme/dawn');
		inEditor.setFontSize(options.fontSize);
		inEditor.on('input', options.onInput);
		inEditor.$blockScrolling = Infinity;

		var outEditor = ace.edit('out-editor');
		outEditor.setTheme('ace/theme/dawn');
		outEditor.setFontSize(options.fontSize);
		outEditor.setReadOnly(true);
		outEditor.getSession().setUseWorker(false);
		outEditor.$blockScrolling = Infinity;

		inEditor.commands.addCommand({
			name: 'eval',
			bindKey: { win: 'Enter', mac: 'Enter' },
			exec: function () {
				history.add(inEditor.getValue());
				doEval();
			}
		});

		inEditor.commands.addCommand({
			name: 'history-up',
			bindKey: { win: 'Ctrl+Up', mac: 'Command+Up' },
			exec: history.up
		});

		inEditor.commands.addCommand({
			name: 'history-down',
			bindKey: { win: 'Ctrl+Down', mac: 'Command+Down' },
			exec: history.down
		});

		return {
			inEditor: inEditor,
			outEditor: outEditor
		};
	}

	var editors = setupEditors({
		fontSize: 16,
		onInput: function () {
			var code = editors.inEditor.getValue();
			ast = getAst(code);
		}
	});

	editors.outEditor.setValue('========\n mupl-c\n========\n\n', -1);

	window.setupExamples('examples', editors.inEditor);
})();