/**
 * EC UI
 * Requires EC modal object 
 * @package ECjs
 */
(function(window, undefined) {
	'use strict';
	
	EC.UI = EC.UI || {};

	var modalCreated = false
		, createModal = function() {
			EC.UI.modal = EC.modal.create({
				title: '',
				content: '',
				footer: '',
				customClose: true
			});

			EC.UI.modal.elements.modal.addClass('ec-ui-modal');
			modalCreated = true;
		};


	EC.core.extend(EC.UI, {
		language: 'en_EN'
		, messages: {
			en_EN: {
				ok: 'Ok',
				accept: 'Ok',
				cancel: 'Cancel',
				yes: 'Yes',
				no: 'No',
				alert: 'Alert',
				confirm: 'Confirm your action',
				prompt: 'Prompt dialog'
			},
			es_ES: {
				ok: 'Ok',
				accept: 'Aceptar',
				cancel: 'Cancelar',
				yes: 'Sí',
				no: 'No',
				alert: 'Alerta',
				confirm: 'Confirma tu acción',
				prompt: 'Diálogo para ingresar información'
			}
		}
		/** Main modal for our UI actions, we'll create it at the bottom */
		, modal: null

		/** Get the UI language */
		, getLanguage: function() {
			return EC.UI.messages[EC.UI.language];
		}

		/**
		 * Alert a message
		 * @param {String} msg
		 * @return void
		 */
		, alert: function(msg, title) {
			var messages = EC.UI.getLanguage(), okbutton;
			if( ! modalCreated ) {
				createModal();
			}
			if( ! title ) {
				title = messages.alert;
			}
			EC.UI.modal.elements.modal_title.get(0).innerHTML = title;
			EC.UI.modal.elements.modal_content.get(0).innerHTML = msg;
			// Vaciar
			EC.UI.modal.elements.modal_footer.get(0).innerHTML = '';
			EC.UI.modal.elements.modal_footer.append(
				okbutton = EC.DOM.create('button', {
					className: 'ec-ui-btn ec-ui-btn-ok',
					innerHTML: messages.ok,
					onclick: function() {
						EC.UI.modal.close();
					}
				})
			);
			EC.UI.modal.show(function() {
				okbutton.get(0).focus();
			});
		}

		/**
		 * Confirm an action
		 * @param {String} msg the message
		 * @param {Function} callback the callback function. The first argument in that function will be the action (true or false)
		 * @param {String} title the title if you want to override the default one
		 */
		, confirm: function(msg, callback, title) {
			var messages = EC.UI.getLanguage(), okbutton;
			if( ! modalCreated ) {
				createModal();
			}
			if( ! title ) {
				title = messages.confirm;
			}
			EC.UI.modal.elements.modal_title.get(0).innerHTML = title;
			EC.UI.modal.elements.modal_content.get(0).innerHTML = msg;
			// Vaciar
			EC.UI.modal.elements.modal_footer.get(0).innerHTML = '';
			EC.UI.modal.elements.modal_footer
			.append(
				EC.DOM.create('button', {
					className: 'ec-ui-btn ec-ui-btn-cancel',
					innerHTML: messages.cancel,
					onclick: function() {
						EC.UI.modal.close();
						callback(false);
					}
				})
			)
			.append(
				okbutton = EC.DOM.create('button', {
					className: 'ec-ui-btn ec-ui-btn-ok',
					innerHTML: messages.accept,
					onclick: function() {
						EC.UI.modal.close();
						callback(true);	
					}
				})
			);

			EC.UI.modal.show(function() {
				okbutton.get(0).focus();
			});
		}
		, prompt: function(msg, callback, defaultValue, title) {
			var messages = EC.UI.getLanguage(),
				input = EC.DOM.create('input', {
					className: 'ec-ui-input',
					type: 'text',
					value: defaultValue || ''
				});
			if( ! modalCreated ) {
				createModal();
			}
			if( ! title ) {
				title = messages.prompt;
			}
			EC.UI.modal.elements.modal_title.get(0).innerHTML = title;
			EC.UI.modal.elements.modal_content.get(0).innerHTML = msg;
			EC.UI.modal.elements.modal_content.append(
				EC.DOM.create('div', {
					className: 'ec-ui-input-wrapper'
				}).append(input)
			);
			EC.UI.modal.elements.modal_footer.get(0).innerHTML = '';
			EC.UI.modal.elements.modal_footer.append(
				EC.DOM.create('button', {
					className: 'ec-ui-btn ec-ui-btn-ok',
					innerHTML: messages.ok,
					onclick: function() {
						EC.UI.modal.close();
						callback(input.get(0).value);
					}
				})
			);
			EC.UI.modal.show(function() {
				input.get(0).focus();
				input.get(0).select();	
			});
		}
	});


}(window));