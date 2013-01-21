/*
 * @author Emilio Cobos (http://emiliocobos.net)
 */
(function(window) {
	var document = window.document,
		EC = window.EC = window.EC || {};

	EC.core = EC.core || {};
	/*
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
	}

	EC.core.extend(EC, {
		baseScriptPath: (function() {
			var s = document.scripts[document.scripts.length - 1];
			return s.src ? s.src.replace(/[a-z0-9\._]+\.js$/, '') : null;
		}())
		/*
		 * Check if a module is loaded
		 * Eg: EC.loaded('DOM/event')
		 */
		,loaded: function(def) {
					var def = def.split('/'),
						i = def.length,
						obj = EC;
					while( i-- ) {
						if( typeof EC[def[i]] === 'undefined' ) {
							return false;
						}
					}
					return true;
				}
		, load: function(modules, callback) {
			var getUrl = function(alias) {
					return EC.baseScriptPath + 'ec.' + alias.replace(/\//g, '_').toLowerCase() + '.js';
				}
				, cb

			if( typeof modules === 'string' ) {
				modules = [modules];
			}
			cb = function() {
				var len = modules.length,
					i = 0;
				for( ; i < len; i++) {
					if( ! EC.loaded(modules[i]) ){
						console.log(modules[i], ' no cargado')
						return;
					}
				}
				if( callback && typeof callback === 'function' ) {
					callback();
				}
			}

			modules = EC.core.map(modules, function(module) {
				return ! EC.loaded(module);
			})

			EC.core.forEach(modules, function(alias) {
				var src = getUrl(alias);
				EC.core.loadJS(src, cb);
			})
		}
	});

	EC.core.extend(EC.core, {
		loadJS: (function() {
			var firstScript = document.getElementsByTagName('script')[0],
				parent = firstScript.parentNode;
			return function(src, callback, error) {
				var s = document.createElement('script'),
					loaded;
				s.async = true;
				s.onload = s.onreadystatechange = function() {
					if( ! loaded && (! s.readyState || s.readyState === 'complete') ) {
						loaded = true;
						if( callback && typeof callback === 'function' ) {
							callback.call(null, s);
						}
					} else if( (! loaded) && s.readyState === 'loaded' ) {
						if( error && typeof error === 'function' ) {
							error.call(null, s);
						}
					}
				}
				s.onerror = error;
				s.src = src;
				parent.insertBefore(s, firstScript);
			}
		}())
		/*
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
		/*
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
		, map: function(arr, callback) {
			var ret = [];
			EC.core.forEach(arr, function(item, i) {
				if( callback ) {
					if( false !== callback(item, i) ) {
						ret.push(item);
					}
				} else if( item ) {
					ret.push(item);
				}
			});

			return ret;
		}
	});
}(window, undefined));