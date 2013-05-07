/*
 * @author Emilio Cobos (http://emiliocobos.net)
 */
(function(window, undefined) {
	var 
		document = window.document
		, EC = window.EC = window.EC || {
			baseScriptPath: (function() {
				var s = document.scripts[document.scripts.length - 1];
				return s.src ? s.src.replace(/[a-z\.A-Z0-9]+\.js$/, '') : null;
			}())
		}
		/**
		 * @internals
		 */
		, firstScript = document.getElementsByTagName('script')[0]
		, loadedElements = {};



	EC.core = EC.core || {};
	/**
	 * Merge two objects
	 * @param {Object} obj1 the object to extend
	 * @param {Object} obj2 the second object to merge
	 */
	EC.core.extend = function(obj1, obj2) {
		var i;
		for( i in obj2 ) {

			if( obj2.hasOwnProperty(i) ) {
				obj1[i] = obj2[i];
			}
		}
		return obj1;
	};

	EC.core.extend(EC.core, {
		/**
		 * Check if a module is loaded
		 * Eg: EC.core.loaded('DOM')
		 */
		loaded: function(def) {
			var i;
			
			def = def.split('/');
			i = def.length;

			while( i-- ) {
				if( typeof EC[def[i]] === 'undefined' ) {
					return false;
				}
			}
			return true;
		}
		, require: function(modules, callback) {
			var getUrl = function(alias) {
					return EC.baseScriptPath + 'ec.' + alias.replace(/\//g, '_').toLowerCase() + '.js';
				}
				, cb;

			if( typeof modules === 'string' ) {
				modules = [modules];
			}
			cb = function() {
				var len = modules.length,
					i = 0;
				for( ; i < len; i++) {
					if( ! EC.core.loaded(modules[i]) ){
						return;
					}
				}
				if( callback && typeof callback === 'function' ) {
					callback();
				}
			};

			EC.core.forEach(modules, function(alias) {
				var src;
				if( EC.core.loaded(alias) ) {
					return cb();
				}
				src = getUrl(alias);
				EC.core.loadJS(src, cb);
			});

		}
		/**
		 * Load a script element
		 * @param {String} src the src of the script
		 * @param {Function} callback a callback function to be executed when script loads
		 * @return void
		 */
		, loadJS: function(src, callback) {
			var s = document.createElement('script'),
				loaded;
			s.async = true;
			s.onload = s.onreadystatechange = function() {
				if( ! loaded && (! s.readyState || s.readyState === 'complete' || s.readyState === 'loaded') ) {
					loaded = true;
					if( callback && typeof callback === 'function' ) {
						callback.call(null, s);
					}
				}
			};
			s.src = src;
			firstScript.parentNode.insertBefore(s, firstScript);
		}

		, loadCSS: function(href, callback, id) {
			var link = document.createElement('link');

			if( id !== undefined ) {
				link.id = id;
			} else {
				id = href;
			}

			if( id in loadedElements ) {
				return loadedElements[id];
			}

			link.href = href;
			link.rel = 'stylesheet';
			link.type = 'text/css';
	
			loadedElements[id] = link;

			firstScript.parentNode.insertBefore(link, firstScript);
			setTimeout(callback, 0);
		}
		/**
		 * Loop through a list or nodelist or array, and execute a callback with each one of them
		 * @param {Array|NodeList} list
		 * @param {Function} callback
		 * @return {Boolean} always true
		 */
		, forEach: function(list, callback) {
			var i = 0,
				len = list.length;

			for( ; i < len; i++ ) {
				callback.call(list[i], list[i], i);
			}
			return true;
		}
		/**
		 * Parses a JSON string
		 * @param {String} str the string to parse
		 * @return {Object}
		 */
		, parseJSON: function(str) {
			if( window.JSON && window.JSON.parse ) {
				return window.JSON.parse(str);
			}

			return (new Function("return " + str)());
		}

		/**
		 * Escape an html string
		 * @param {String} str the string to escape
		 * @return {String} the escaped string
		 */
		, htmlEscape: function(str) {
			return str.replace(/&|<|>/g, function(match) {
				return {
					'&': '&amp;',
					'<': '&lt;',
					'>': '&gt;'
				}[match];
			});
		}

		/**
		 * Check if given argument is an array
		 * @return {Boolean}
		 */
		, isArray: Array.isArray || function(a) {
			return Object.prototype.toString.call(a) === '[object Array]';
		}
	});

	EC.require = EC.core.require;
}(window));