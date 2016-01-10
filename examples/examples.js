(function () {
	'use strict';

	var examples = [{
		name: 'add-1',
		code: '(+ 3 5)'
	}, {
		name: 'add-2',
		code: '(+ (- 2 1) (- 4 3))'
	}, {
		name: 'if-1',
		code: '(if 0 123 321)'
	}, {
		name: 'let-1',
		code: '(let ((a 123) (b 321))\n\t(+ a b))'
	}, {
		name: 'set!-1',
		code: '(let ((a 123))\n\t(set! a 456 a))'
	}, {
		name: 'lambda-1',
		code: '((lambda (a) a) 123)'
	}, {
		name: 'call/cc-1',
		code: [
			'(let ((return 0))',
			'\t(+ 1 (call/cc',
			'\t\t(lambda (cont) ',
			'\t\t\t(set! return cont ',
			'\t\t\t\t(return 123))))))'
		].join('\n')
	}];

	function setupExamples(examplesId, editor) {
		var exampleElements = examples.map(function (example) {
			var element = document.createElement('a');

			element.classList.add('example');
			element.textContent = example.name;
			element.addEventListener('click', function () {
				editor.setValue(example.code, 1);
			});

			return element;
		});

		var examplesContainer = document.getElementById(examplesId);

		exampleElements.forEach(function (exampleElement) {
			examplesContainer.appendChild(exampleElement);
		});
	}

	window.setupExamples = setupExamples;
})();