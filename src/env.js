(function () {
	'use strict';

	function Env(entry, tail) {
		this.entry = entry;
		this.tail = tail;
	}

	Env.prototype.con = function (entry) {
		return new Env(entry, this);
	};

	Env.prototype.find = function (key) {
		if (this.entry.key === key) {
			return this.entry.value;
		} else {
			return this.tail.find(key);
		}
	};

	Env.prototype.set = function (key, value) {
		if (this.entry.key === key) {
			this.entry.value = value;
			return this;
		} else {
			return this.tail.set(key, value);
		}
	};

	Env.EMPTY = {
		con: function (entry) {
			return new Env(entry, Env.EMPTY);
		},
		find: function (key) {
			throw new Error('Entry with key ' + key + ' could not be found');
		},
		set: function (key, value) {
			throw new Error('Entry with key ' + key + ' could not be found');
		}
	};

	if (!window.cps) { window.cps = {}; }
	window.cps.Env = Env;
})();