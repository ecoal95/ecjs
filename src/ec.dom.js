EC.DOM = EC.DOM || {};
EC.core.extend(EC.DOM, {
	/*
	 * Select some elements and return a new instance of DOMInstance
	 */
	select: function(selector) {
		return new EC.DOMInstance(selector);
	}
	, create: function(tag, props) {
		var el = document.createElement(tag),
			i;

		for( i in props ) {
			if( props.hasOwnProperty(i) ) {
				if( i !== 'style' && i !== 'attributes' ) {
					el[i] = props[i];
				}
			}
		}
		if( props.style ) {
			EC.core.extend(el.style, props.style);
		}
		if( props.attributes ) {
			for( i in props.attributes ) {
				if( props.attributes.hasOwnProperty(i) ) {
					el.setAttribute(i, props.attributes[i]);
				}
			}
		}
		return EC.DOM.select(el);
	}
	/*
	 * See if an element or the window supports an especified property
	 */
	, supportsProp: (function(){
		var testElement = document.createElement('_'),
			testedProps = {},
			prefixes = [ 'webkit', 'moz', 'ms', 'o' ],
			len = prefixes.length;
		/*
		 * The function returned:
		 * @param {String} prop the prop to test
		 * @param {Node|Boolean} inElement the element to test again. if it's a node, it will check whith that node. 
		 * Else it will test with `testElement`. If its false or undefined, it will check with the window.
		 * @return {String|Boolean} if we have support, it returns the prefixed string. Else it returns false
		 */
		return function(prop, inElement) {
			var i = 0,
				totest;
			if( testedProps[prop] ) {
				return testedProps[prop];
			}

			if( inElement ) {
				if( inElement.nodeType ) {
					totest = inElement;
				} else {
					totest = testElement;
				}
			} else {
				totest = window;
			}

			if( prop in totest ) {
				testedProps[prop] = prop;
				return prop;
			} else {
				prop = prop.charAt(0).toUpperCase() + prop.substring(1);
			}
			for(; i < len; i++ ) {
				if( (prefixes[i] + prop) in totest ) {
					testedProps[prop] = prefixes[i] + prop;
					return testedProps[prop];
				}
			}
			return false;
		}
	})()
	/*
	 * If an element matches the selector
	 * @param {Node} el a dom element for testing
	 * @param {String} selector the selector to test against
	 * @return {Boolean}
	 */
	, matchesSelector: function(el, selector) {
		var prefixed;
		if( prefixed = EC.DOM.supportsProp('matchesSelector', el) ) {
			return el[prefixed](selector);
		}

		switch(selector.substring(0,1)) {
			case '.':
				// Sólo vale para una clase
				return (new RegExp('\\b' + selector.substring(1) + '\\b')).test(el.className);
				// no hace falta break porque usamos return
			case '#':
				return el.id === selector.substring(1);
			default:
				return el.nodeName.toLowerCase() === selector.toLowerCase();
		}
	}

	/*
	 * Event object
	 */
	, event:  {
		/*
		 * Add an event listener to a node
		 * @param {Node|String} node the node or the selector
		 * @param {String} type the type of the event
		 * @param {String|Function} selector the delegation target, or the callback if there isn't
		 * @return {Boolean} always true
		 */
		add: function(el, type, selector, fn) {
			var eventGenericFunc = function(e) {
				e = e || window.event;
				if( ! e.preventDefault ) {
					e.preventDefault = function() {
						e.returnValue = false;
					}
					e.stopPropagation = function() {
						e.cancelBubble = true;
					}
				}
				e.target = e.target || e.srcElement;
				e.keyCode = e.keyCode || e.which;
				if( selector ) {
					console.log(e.target);
					if( EC.DOM.matchesSelector(e.target, selector) ) {
						fn.call(e.target, e);
					}
					return;
				}

				fn.call(el, e);
			}
			if( ! fn ) {
				fn = selector;
				selector = null;
			}

			if( el.addEventListener ) {
				el.addEventListener(type, eventGenericFunc, false)
			} else {
				el.attachEvent('on' + type, eventGenericFunc);
			}
			return true;
		}
	}
});

/*
 * Creates an instance with elements
 * @param {String|Node} selector
 * @constructor
 * @return {EC.DOMInstance}
 */
EC.DOMInstance = function(selector) {
	if( selector.nodeType ) {
		this.els = [selector];
	} else if( typeof selector === 'string' ) {
		switch(selector) {
			case 'body':
				this.els = [document.body];
				break;
			case 'html':
				this.els = [document.documentElement];
				break;
			default:
				if( (/^#([0-9A-Z-_])$/i).test(selector) ) {
					this.els = [document.getElementById(RegExp.$1)];
				} else {
					this.els = document.querySelectorAll(selector);
				}
		}

	}
	return this;
}

EC.core.extend(EC.DOMInstance.prototype, {
	els: []
	/*
	 * Execute a callback for each element
	 * @param {Function} cb
	 * @see EC.core.forEach
	 */
	, forEach: function(cb) {
		EC.core.forEach(this.els, cb);
		return this;
	}
	/*
	 * Set an attribute value or get the value from the first element
	 * @param {String} att the attribute name
	 * @param {String} value the attribute value
	 */
	, attr: function(att, value) {
		var el;
		if( typeof value === 'undefined' ) {
			if( el = this.els[0] ) {
				return el.getAttribute(att);
			}
			return null;
		} else {
			return this.forEach(function(el) {
				el.setAttribute(att, value);
			});
		}
	}
	/*
	 * Adds a class to each element
	 * @param {String} cls the class to add
	 */
	, addClass: function(cls) {
		return this.forEach(function(el) {
			el.className += ' ' + cls;
		});
	}
	/*
	 * Remove a class to each element
	 * @param {String} cls the class to remove
	 */
	, removeClass: function(cls) {
		var rgx = new RegExp('\\b(' + cls.split(' ').join('|') + ')\\b', 'g');
		return this.forEach(function(el) {
			el.className = el.className.replace(rgx, '')
		});
	}
	/*
	 * Check if an element has a className
	 * @param {String} cls the class to look for
	 */
	, hasClass: function(cls) {
		var rgx = new RegExp('\\b(' + cls + ')\\b', 'g'),
			el;
		if( el = this.els[0] ) {
			return rgx.test(el.className);
		}
		return false;
	}

	/*
	 * Get a node given its index in the container array, or get all
	 * @param {Number} index
	 * @return {Node|Array}
	 */
	, get:  function(index) {
		if( typeof index !== 'undefined' ) {
			return this.els[index];
		} else {
			return this.els;
		}
	}
	/*
	 * Get another instance with the first element in the container array
	 */
	, first: function() {
		return new EC.DOMInstance(this.els[0]);
	}
	/*
	 * Append an element to the current element
	 * @param el {EC.DOMInstance|Node}
	 */
	, append: function(el) {
		var current = this.els[0];
		if( ! current ) {
			return;
		}

		if( el instanceof EC.DOMInstance ) {
			el.forEach(function(el) {
				current.appendChild(el);
			});
		} else {
			current.appendChild(el);
		}
		
		return this;
	}
	, appendTo: function(el) {
		if( typeof el === 'string' || el.nodeType) {
			el = EC.DOM.select(el);
		}
		return this.forEach(function(appended) {
			el.append(appended)
		});
	}
	/*
	 * @see EC.DOM.event.add
	 */
	, on: function(type, selector, cb) {
		return this.forEach(function(el) {
			EC.DOM.event.add(el, type, selector, cb);
		})
	}
})

// Igualar a la función $
if( ! window.$ ) {
	window.$ = EC.DOM.select;
}


/*
 * Some IE compatibility
 */
if ( ! document.querySelectorAll) {
	(function() {
		var head = document.documentElement.firstChild,
			styleTag = document.createElement('STYLE');
	
		head.appendChild(styleTag);

		document.querySelectorAll = function(selector) {
			document.__qsaels = [];
			styleTag.styleSheet.cssText = selector + "{x:expression(document.__qsaels.push(this))}";
			window.scrollBy(0, 0);
			
			return document.__qsaels;
		}
	}())
} // document.querySelectorAll

if( ! document.querySelector ) {
	document.querySelector = function(selector) {
		return document.querySelectorAll(selector)[0] || null;
	}
} // querySelector