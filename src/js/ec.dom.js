/** jshint global EC:true */
(function(window, undefined) {
	'use strict';
	
	EC.DOM = EC.DOM || {};

	/**
	 * Convert a nodelist to array
	 * @param {NodeList} nodelist the nodelist
	 * @return {Array} the nodes in an array
	 * @internal
	 */
	var nodeListToArray = function(nodelist) {
		var ret = [],
			len = nodelist.length;

		for(; len--; ret.unshift(nodelist[len]));

		return ret;
	}

	/**
	 * @internal
	 * Create a className regex
	 * @param {String} className
	 * @return {RegExp}
	 */
	, generateClassNameRegExp = (function() {
		var cache = {};
		return function(className) {
			if( ! cache.hasOwnProperty(className) ) {
				cache[className] = new RegExp('\\b(' + className + ')\\b', 'g');
			}
			return cache[className];
		};
	}());


	EC.core.extend(EC.DOM, {
		/**
		 * Select some elements and return a new instance of DOMInstance
		 */
		select: function(selector, context) {
			return new EC.DOMInstance(selector, context);
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
		/**
		 * See if an element or the window supports an especified property
		 */
		, supportsProp: (function(){
			var testElement = document.createElement('_'),
				testedProps = {},
				prefixes = [ 'Webkit', 'Moz', 'Ms', 'O', 'webkit', 'moz', 'ms', 'o' ],
				len = prefixes.length;
			/**
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
					if( typeof inElement === 'boolean' ) {
						totest = testElement;
					} else {
						totest = inElement;
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
			};
		})()
		/**
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
					return (generateClassNameRegExp(selector.substring(1))).test(el.className);
					// no hace falta break porque usamos return
				case '#':
					return el.id === selector.substring(1);
				default:
					return el.nodeName.toLowerCase() === selector.toLowerCase();
			}
		}

		/**
		 * Event object
		 */
		, event:  {
			/**
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
						};
					}
					if( ! e.stopPropagation ) {
						e.stopPropagation = function() {
							e.cancelBubble = true;
						};
					}

					if( ! e.target ) {
						e.target = e.srcElement;
					}

					if( ! e.keyCode && e.which ) {
						e.keyCode = e.which;
					}
					if( selector ) {
						if( EC.DOM.matchesSelector(e.target, selector) ) {
							fn.call(e.target, e);
						}
						return;
					}

					fn.call(el, e);
				};
				if( ! fn ) {
					fn = selector;
					selector = null;
				}

				if( el.addEventListener ) {
					el.addEventListener(type, eventGenericFunc, false);
				} else {
					el.attachEvent('on' + type, eventGenericFunc);
				}
				return true;
			}
		}
	});

	/**
	 * Creates an instance with elements
	 * @param {String|Node} selector
	 * @param {EC.DOMInstance|String|} justone if we must use querySelector (true) or querySelectorAll (false, by default)
	 * @constructor
	 * @return {EC.DOMInstance}
	 */
	EC.DOMInstance = function(selector, context) {
		if( context ) {
			if( typeof context === 'string' || context.nodeType ) {
				context = new EC.DOMInstance(context);
			}
			if( context instanceof EC.DOMInstance ) {
				return context.find(selector);
			}
		}
		if( ! selector ) {
			this.els = [];
		} else if( selector.nodeType ) {
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
						this.els = nodeListToArray(document.querySelectorAll(selector));
					}
			}
		}
		return this;
	};

	EC.core.extend(EC.DOMInstance.prototype, {
		els: []
		/**
		 * Execute a callback for each element
		 * @param {Function} cb
		 * @see EC.core.forEach
		 */
		, forEach: function(cb) {
			EC.core.forEach(this.els, cb);
			return this;
		}
		/**
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
		/**
		 * Adds a class to each element
		 * @param {String} cls the class to add
		 */
		, addClass: function(cls) {
			var reg = generateClassNameRegExp(cls);
			return this.forEach(function(el) {
				// Basically a if ! hasClass then addClass
				if( ! reg.test(el.className) ) {
					el.className += ' ' + cls;
				}
			});
		}
		/**
		 * Remove a class to each element
		 * @param {String} cls the class to remove
		 */
		, removeClass: function(cls) {
			var rgx = generateClassNameRegExp(cls.split(' ').join('|'));
			return this.forEach(function(el) {
				el.className = el.className.replace(rgx, '');
			});
		}
		/**
		 * Check if an element has a className
		 * @param {String} cls the class to look for
		 */
		, hasClass: function(cls) {
			var rgx = generateClassNameRegExp(cls),
				el;
			if( el = this.els[0] ) {
				return rgx.test(el.className);
			}
			return false;
		}

		/**
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
		/**
		 * Get another instance with the first element in the container array
		 */
		, first: function(selector) {
			var el = this.els[0];
			if( selector === undefined ) {
				return new EC.DOMInstance(el);
			}

			return  new EC.DOMInstance(el.querySelector(selector));
		}
		/**
		 * Append an element to the current element
		 * @param el {EC.DOMInstance|Node}
		 */
		, append: function(el) {
			var current = this.els[0];
			if( ! current ) {
				return;
			}

			if( typeof el === 'string' ) {
				current.innerHTML += el;
			} else if( el instanceof EC.DOMInstance ) {
				el.forEach(function(toAppend) {
					current.appendChild(toAppend);
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
				el.append(appended);
			});
		}
		/**
		 * @see EC.DOM.event.add
		 */
		, on: function(type, selector, cb) {
			return this.forEach(function(el) {
				EC.DOM.event.add(el, type, selector, cb);
			});
		}

		/**
		 * Find elements that match a selector inside the elements of this instance
		 * @param {String} selector
		 * @return EC.DOMInstance
		 */
		, find: function(selector) {
			var
				elements = [],
				ret = new EC.DOMInstance();
			this.forEach(function(el) {
				elements = elements.concat(nodeListToArray(el.querySelectorAll(selector)));
			});

			ret.els = elements;

			return ret;
		}

		/**
		 * Set CSS styles over the elements
		 * @param {String|Object} props the prop to set or a map of the props
		 * @param {String} val the value the prop is going to get if prop is a String
		 * @return EC.Dominstance
		 */
		, css: function( props, val ) {
			if( val !== undefined ) {
				return this.forEach(function(el) {
					el.style[props] = val;
				});
			}

			return this.forEach(function(el) {
				var prop;
				for( prop in props ) {
					if( props.hasOwnProperty(prop) ) {
						el.style[prop] = props[prop];
					}
				}
			});
		}

		/**
		 * Remove elements from the DOM
		 * @return EC.Dominstance
		 */
		, remove: function() {
			return this.forEach(function(el) {
				if( el.parentNode ) {
					el.parentNode.removeChild(el);					
				}
			});
		}

		, animate: (function(){
			var transition_prefixed = EC.DOM.supportsProp('transition', document.documentElement.style),
				transitions = {
					'transition':'transitionend',
					'OTransition':'oTransitionEnd',
					'MozTransition':'transitionend',
					'WebkitTransition':'webkitTransitionEnd'
				},
				transitionend;

			/** If there's no support for transitions, just return the css function */
			if( transition_prefixed === false ) {
				return function(props, duration, easing, callback) {
					this.css(props);
					if( callback && typeof callback === 'function' ) {
						return this.forEach(function(el) {
							callback.call(el);
						});
					}
					return this;
				};
			}

			transitionend = transitions[transition_prefixed];
			return function(props, duration, easing, callback) {
				var transition = [],
					prop;
				/** If there's no element, we don't even try */
				if( ! this.els[0] ) {
					return this;
				}
				if( ! duration ) {
					duration = 600;
				}
				if( ! easing ) {
					easing = 'ease';
				}

				duration /= 1000;

				for(prop in props) {
					if( props.hasOwnProperty(prop) ) {
						transition.push(prop + ' ' + duration + 's ' + easing);
					}
				}

				transition = transition.join(',');

				if( callback && typeof callback === 'function' ) {
					this.forEach(function(el) {
						el.addEventListener(transitionend, function ontransitionend(e) {
							callback.call(el, e);
							el.removeEventListener(transitionend, ontransitionend);
						}, false);
					});
				}

				this.forEach(function(el) {
					el.style[transition_prefixed] = transition;
				});
				// reflow
				this.els[0].offsetWidth;


				return this.css(props);
			};
		}())
	});

	// Igualar a la función $
	if( typeof window.$ !== 'function' ) {
		window.$ = EC.DOM.select;
	}


	/**
	 * Some IE compatibility
	 */
	if ( ! document.querySelectorAll) {
		(function() {
			var head = document.documentElement.firstChild,
				styleTag = document.createElement('style');
		
			head.appendChild(styleTag);

			document.querySelectorAll = function(selector) {
				document.__qsaels = [];
				styleTag.styleSheet.cssText = selector + "{x:expression(document.__qsaels.push(this))}";
				window.scrollBy(0, 0);
				
				return document.__qsaels;
			};
		}());
	} // document.querySelectorAll

	if( ! document.querySelector ) {
		document.querySelector = function(selector) {
			return document.querySelectorAll(selector)[0] || null;
		};
	} // querySelector
}(window));