/**
 * Recommended: use window.Notification polyfill (https://gist.github.com/ecoal95/4393774)
 */
(function(window, undefined) {
	'use strict';
	EC.notification = EC.notification || {};

	/** @internal */
	var dom_notification_id = 0;

	EC.core.extend(EC.notification, {
		/**
		 * Check for native notification support
		 */
		nativeSupport: !! window.Notification,
		/**
		 * Create a new notification
		 * @param {String} title the notification title
		 * @param {Object} options the options (see http://emiliocobos.net/notificaciones-con-javascript-al-estilo-de-gmail/)
		 */
		create: function(title, options) {
			if( EC.notification.nativeSupport ) {
				return new window.Notification(title, options || {});
			} else if( EC.DOM ) {
				return new EC.notification.DOMBasedNotification(title, options);
			}
		},

		/**
		 * Create a new DOM notification, with similar interface
		 * Needs the correct CSS
		 * @require EC.DOM
		 */
		DOMBasedNotification: function(title, options) {
			var self = this,
				element;

			options = self.options = options || {};

			element = self.element = EC.DOM.create('div', {
				className: 'ec-dom-notification',
				innerHTML: (function() {
					var out = '<div class="ec-dom-notification-close">&times;</div><h2 class="ec-dom-notification-title">' + title + '</h2>';
					if( options.iconUrl ) {
						out += '<img class="ec-dom-notification-icon" src="' + options.iconUrl + '" alt>';
					}
					if( options.body ) {
						out += '<div class="ec-dom-notification-body">' + EC.core.htmlEscape(options.body) + '</div>';
					}
					return out;
				}()),

				id: 'ec-dom-notification-' + (++dom_notification_id)
			});

			if( typeof options.onclick === 'function' ) {
				/** TODO: emulate contextualization */
				element.on('click', options.onclick);
			}

			element.first('.ec-dom-notification-close').on('click', function() {
				self.close();
			});

			return self;
		}
	});

	EC.core.extend(EC.notification.DOMBasedNotification.prototype, {
		show: function() {
			this.element.appendTo('body');

			if( typeof this.options.onshow === 'function' ) {
				this.options.onshow.call(this);
			}
		},

		close: function() {
			this.element.addClass('is-hidden');//.remove();
			if( typeof this.options.onclose === 'function' ) {
				this.options.onclose.call(this);
			}
		}
	});

}(window));