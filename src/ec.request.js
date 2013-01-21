/*
 * Perform a generic query
 * @param options the options passed (see the first EC.core.extend)
 * @return {Boolean} always true
 */
EC.request = EC.request || (function(options) {
	var request = EC.request.new();
	options = EC.core.extend({
		method: 'GET',
		url: '',
		requestContentType: null,
		data: null,
		processData: true,
		onsuccess: null,
		onerror: null,
		async: true,
		type: null,
		context: null
	}, options);

	if( options.type === 'jsonp' ) {
		return EC.request.jsonp(options);
	}

	if( options.method === 'GET' && options.data ) {
		options.url += (options.url.indexOf('?') > -1 ? '&' : '?') + EC.request.generateQuery(options.data);
		options.data = null;
	}
	request.open(options.method, options.url, options.async);

	if( options.requestContentType && request.setRequestHeader) {
		request.setRequestHeader('Content-Type', options.requestContentType);
	}

	request.onreadystatechange = function() {
		var response;
		if( request.readyState === 4 ) {
			if( request.status === 200 ) {
				if( options.type === 'json' ) {
					response = EC.core.parseJSON(request.responseText)
				} else if (options.type === 'xml') {
					response = request.responseXML;
				} else {
					response = request.responseText;
				}

				if( options.onsuccess && typeof options.onsuccess === 'function' ) {
					options.onsuccess.call(options.context, response, request);
				}
			} else if( options.onerror && typeof options.onerror === 'function' ) {
					options.onerror.call(options.context, response, request);
			}

		}
	}

	if( options.processData && options.data ) {
		options.data = EC.request.generateQuery(options.data);
	}
	request.send(options.data);
	return true;
});

EC.core.extend(EC.request, {
	/*
	 * Create a cross-browser AJAX request
	 * @return {XMLHttpRequest|ActiveXObject}
	 */
	new: function() {
		if( window.XMLHttpRequest ) {
			return new window.XMLHttpRequest;
		}

		return new ActiveXObject('Microsoft.XMLHTTP')
	}
	/*
	 * Creates a query string from an object
	 * @param {Object|String} data the query string key => value pairs
	 * @return {String} the fetched query string
	 */
	, generateQuery: function(data) {
		var qs = null,
			i;
		if( typeof data === 'string' || (window.FormData && data instanceof window.FormData) ) {
			return data;
		}
		for( i in data ) {
			if( data.hasOwnProperty(i) ) {
				if( qs === null ) {
					qs = i + '=' + encodeURIComponent(data[i]);
				} else {
					qs = '&' + i + '=' + encodeURIComponent(data[i]);
				}
			}
		}
		return qs;
	}
	/*
	 * Perform a JSONP request
	 */
	, jsonp: function(options) {
			var callbackName = 'ec_' + (+new Date),
				src;

			options.data = options.data || {};
			options.data.callback = callbackName;
			window[callbackName] = function(data) {
				if( options.onsuccess && typeof options.onsuccess === 'function' ) {
					options.onsuccess.call(options.context, data);
				}
				window[callbackName] = undefined;
			}

			src = options.url + (options.url.indexOf('?') > -1 ? '&' : '?') + EC.request.generateQuery(options.data);
			EC.core.loadJS(src, function(script) { script.parentNode.removeChild(script) }, options.onerror);
		}
	, get: function(url, callback) {
		return EC.request({
			"url": url,
			"method": 'GET',
			"onsuccess": callback
		});
	}
	, post: function(url, data, callback) {
		if( typeof url === 'string' ) {
			return EC.request({
				"url": url,
				"method": 'POST',
				"onsuccess": callback,
				"data": data
			});
		} else {
			return EC.request(EC.core.extend({
				'method': 'POST'
			}, url));
		}
	}
})