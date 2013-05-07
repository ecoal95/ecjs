(function(window, undefined) {
	'use strict';
	var last_modal_id = 0;
	/**
	 * @constructor
	 */
	EC.modal = EC.modal || function(options) {
		this.id = ++last_modal_id;
		this.options = EC.core.extend({
			animation: 'fade', // ['fade', 'none']
			animationDuration: 600,
			maxWidth: 600,
			topDistance: '25%',
			title: undefined,
			content: undefined,
			footer: undefined,
			// you may introduce another way of closing the modal (like EC.UI)
			customClose: false
		}, options);
		this.elements = this._createElements();

		return this;
	};

	EC.modal.create = function(options) {
		return new EC.modal(options);
	};
	EC.core.extend(EC.modal.prototype, {
		options: {}
		/** Reference to the elements */
		, elements: {}

		/**
		 * Create the modal components
		 */
		, _createElements: function() {
			var that = this,
				elements = {};
			elements.modal = EC.DOM.create('div', {
				className: 'ec-modal',
				id: 'ec-modal-' + this.id,
				style: {
					display: 'none',
					width: '90%',
					maxWidth: this.options.maxWidth + 'px'
				}
			}).appendTo('body');

			EC.core.forEach(['title','content', 'footer'], function(part) {
				if( typeof that.options[part] !== 'undefined' ) {
					elements['modal_' + part] = EC.DOM.create('div', {
						className: 'ec-modal-' + part,
					}).appendTo(elements.modal).append(that.options[part]);
				}
			});

			elements.overlay = EC.DOM.create('div', {
				className: 'ec-modal-overlay',
				style: {
					display: 'none'
				}
			}).appendTo('body');

			if( ! that.options.customClose ) {
				elements.overlay.on('click', function() {
					that.close();
				});
			}

			return elements;
		}

		/**
		 * Remove the modal components
		 */
		, remove: function() {
			this.elements.modal.remove();
			this.elements.overlay.remove();

			return null;
		}

		/**
		 * Show the modal
		 * @param {Function} callback the callback function
		 */
		, show: function(callback) {
			var modal = this.elements.modal,
				overlay = this.elements.overlay;
			
			modal.css({
				visibility: 'hidden',
				display: 'block'
			}); // hide it, position it, and later show it
			this.positionModal();
			modal.css('visibility', 'visible');
			overlay.css('display', 'block');

			switch( this.options.animation ) {
				case 'fade':
					modal.css('opacity', '0');
					overlay.css('opacity', '0');
					overlay.animate({
						opacity: 1
					}, this.options.animationDuration);
					modal.animate({
						opacity: 1
					}, this.options.animationDuration, 'ease', callback);
				break;
			}

			if( callback && typeof callback === 'function' && ! this.options.animation || this.options.animation === 'none') {
				callback();
			}
		}
		/**
		 * Hide the modal
		 */
		, close: function() {
			this.elements.modal.css('display', 'none');
			this.elements.overlay.css('display', 'none');
		}

		/**
		 * Center the modal in the screen
		 */
		, positionModal: function() {
			var modal = this.elements.modal,
				modalelement = modal.get(0),
				half = modalelement.offsetWidth / 2;
			modal.css({
				// If the height is more than the avaliable space, we'll position it absolutely
				position: modalelement.offsetHeight > (window.screen.height * (100 - parseInt(this.options.topDistance,10)) / 100) ? 'absolute': 'fixed',
				top: this.options.topDistance,
				left: '50%',
				marginLeft: '-' + half + 'px'
			});
		}
	});


}(window));