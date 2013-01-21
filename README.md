# ec.js
Una pequeña librería de javascript hecha por mí para ser modular.

Pequeño ejemplo:

```html
<script src="ec.js"></script>
<script>
	EC.load('DOM', function() {
		EC.DOM.select('.container').on('click', function(e) {
			alert('Has hecho click en .container')
		})
	});

	// Si ya está cargado no se volverá a cargar
	EC.load(['DOM', 'request'], function() {
		EC.request({
			url: 'archivo.php',
			method: 'POST',
			data: {
				'Ésto': 'será enviado via POST'
			},
			type: 'json',
			onsuccess: function(response) {
				var link = EC.DOM.create('a', {
					innerHTML: response.message,
					href: response.url
				});
				EC.DOM.select('#container').append(link).addClass('load');
			},
			onerror: function(){
				alert('Hubo un fallo en la solicitud');
			}			
		});
	})
</script>
```
## Autor
Hecho con cuidado por [Emilio Cobos](http://emiliocobos.net/)
