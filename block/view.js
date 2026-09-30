/**
 * CodePress no site: cores, números e destaque de linhas, botão Copiar e
 * expandir/recolher. O código original (texto puro) é guardado antes de colorir,
 * então "Copiar" sempre copia exatamente o que foi escrito.
 */
( function () {
	'use strict';

	var config = window.codepressConfig || {};
	var t = config.i18n || {};

	function copyText( text ) {
		if ( navigator.clipboard && window.isSecureContext ) {
			return navigator.clipboard.writeText( text );
		}
		// Reserva para sites sem HTTPS.
		return new Promise( function ( resolve, reject ) {
			var area = document.createElement( 'textarea' );
			area.value = text;
			area.setAttribute( 'readonly', '' );
			area.style.position = 'fixed';
			area.style.opacity = '0';
			document.body.appendChild( area );
			area.select();
			try {
				document.execCommand( 'copy' ) ? resolve() : reject();
			} catch ( e ) {
				reject( e );
			}
			area.remove();
		} );
	}

	function init( block ) {
		if ( block.classList.contains( 'is-ready' ) ) {
			return;
		}
		var codeEl = block.querySelector( '.codepress__pre code' );
		if ( ! codeEl || ! window.CodePress ) {
			return;
		}

		var source = codeEl.textContent;
		codeEl.innerHTML = window.CodePress.render( source, {
			language: block.getAttribute( 'data-language' ),
			start: block.getAttribute( 'data-start' ),
			highlight: block.getAttribute( 'data-highlight' )
		} );
		block.classList.add( 'is-ready' );

		// Copiar.
		block.querySelectorAll( '[data-cp-copy]' ).forEach( function ( button ) {
			var label = button.querySelector( '.codepress__copy-label' );
			button.setAttribute( 'aria-label', t.copy || 'Copiar' );
			button.addEventListener( 'click', function () {
				copyText( source.replace( /\n$/, '' ) ).then( function () {
					button.classList.add( 'is-copied' );
					if ( label ) {
						label.textContent = t.copied || 'Copiado!';
					}
					clearTimeout( button._cpTimer );
					button._cpTimer = setTimeout( function () {
						button.classList.remove( 'is-copied' );
						if ( label ) {
							label.textContent = t.copy || 'Copiar';
						}
					}, 2000 );
				} );
			} );
		} );

		// Expandir / recolher (só quando o código passa do limite de linhas).
		if ( block.classList.contains( 'is-collapsible' ) ) {
			var toggles = block.querySelectorAll( '[data-cp-fold]' );
			var setState = function ( expanded ) {
				block.classList.toggle( 'is-collapsed', ! expanded );
				toggles.forEach( function ( button ) {
					button.setAttribute( 'aria-expanded', expanded ? 'true' : 'false' );
					var label = button.querySelector( '.codepress__fold-label' );
					if ( label ) {
						label.textContent = expanded ? ( t.collapse || 'Recolher' ) : ( t.expand || 'Expandir' );
					}
				} );
				if ( ! expanded && block.getBoundingClientRect().top < 0 ) {
					block.scrollIntoView( { block: 'start', behavior: 'smooth' } );
				}
			};
			toggles.forEach( function ( button ) {
				button.addEventListener( 'click', function () {
					setState( block.classList.contains( 'is-collapsed' ) );
				} );
			} );
			setState( false );
		}
	}

	function initAll() {
		document.querySelectorAll( '.codepress' ).forEach( init );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAll );
	} else {
		initAll();
	}
}() );
