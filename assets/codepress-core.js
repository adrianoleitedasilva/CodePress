/**
 * CodePress — núcleo compartilhado entre o editor (Gutenberg) e o site.
 *
 * Colore o código com o Prism, divide o resultado em linhas (reabrindo as tags
 * que atravessam linhas, como comentários de várias linhas) e monta cada linha
 * com número e destaque. O editor e o site usam exatamente o mesmo código, então
 * a prévia no editor é idêntica ao que o visitante vê.
 */
( function ( window ) {
	'use strict';

	// Linguagens: vêm do PHP (codepress_languages()) em window.codepressConfig — fonte única.
	var LANGUAGES = ( window.codepressConfig && window.codepressConfig.languages ) || {};
	if ( ! LANGUAGES.plaintext ) {
		LANGUAGES.plaintext = { label: 'Texto', prism: '', icon: 'txt', bg: '#6b7280', fg: '#ffffff' };
	}

	function escapeHtml( text ) {
		return String( text ).replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
	}

	/**
	 * "2, 4-6, 10" -> { 2: true, 4: true, 5: true, 6: true, 10: true }.
	 * Os números seguem a numeração exibida (considerando a linha inicial).
	 */
	function parseRanges( spec ) {
		var lines = {};
		String( spec || '' ).split( ',' ).forEach( function ( part ) {
			var m = part.trim().match( /^(\d+)(?:\s*-\s*(\d+))?$/ );
			if ( ! m ) {
				return;
			}
			var from = parseInt( m[ 1 ], 10 );
			var to = m[ 2 ] ? parseInt( m[ 2 ], 10 ) : from;
			if ( to < from ) {
				var t = from; from = to; to = t;
			}
			for ( var i = from; i <= to && i - from < 2000; i++ ) {
				lines[ i ] = true;
			}
		} );
		return lines;
	}

	/** Código colorido (HTML) de uma linguagem; sem gramática, só escapa o texto. */
	function highlight( code, language ) {
		var lang = LANGUAGES[ language ] || LANGUAGES.plaintext;
		var Prism = window.Prism;
		if ( lang.prism && Prism && Prism.languages[ lang.prism ] ) {
			try {
				return Prism.highlight( code, Prism.languages[ lang.prism ], lang.prism );
			} catch ( e ) {}
		}
		return escapeHtml( code );
	}

	/**
	 * Divide o HTML colorido em linhas. Quando uma tag <span> atravessa uma quebra
	 * de linha, ela é fechada no fim da linha e reaberta no começo da seguinte.
	 */
	function splitLines( html ) {
		var parts = html.split( /(<span[^>]*>|<\/span>|\n)/ );
		var stack = [];
		var lines = [];
		var current = '';
		parts.forEach( function ( part ) {
			if ( ! part ) {
				return;
			}
			if ( part === '\n' ) {
				lines.push( current + new Array( stack.length + 1 ).join( '</span>' ) );
				current = stack.join( '' );
			} else if ( part.indexOf( '<span' ) === 0 ) {
				stack.push( part );
				current += part;
			} else if ( part === '</span>' ) {
				stack.pop();
				current += part;
			} else {
				current += part;
			}
		} );
		lines.push( current );
		return lines;
	}

	/**
	 * HTML final das linhas: <span class="cp-line" data-ln="N">…</span>, uma por linha.
	 * As linhas NÃO são separadas por "\n": dentro do <pre>, a quebra de texto somada ao
	 * display:block de cada linha geraria uma linha em branco extra entre as linhas.
	 * Ao selecionar e copiar à mão, o navegador já quebra a linha entre os blocos; o
	 * botão Copiar usa o código original.
	 *
	 * @param {string} code    Código puro.
	 * @param {Object} options { language, start, highlight: "2,4-6" }.
	 */
	function render( code, options ) {
		options = options || {};
		var source = String( code || '' ).replace( /\r\n?/g, '\n' ).replace( /\n$/, '' );
		var parsedStart = parseInt( options.start, 10 );
		var start = isNaN( parsedStart ) ? 1 : Math.max( 0, parsedStart ); // 0 é válido
		var marked = parseRanges( options.highlight );
		var lines = splitLines( highlight( source, options.language ) );

		return lines.map( function ( line, i ) {
			var number = start + i;
			// Linhas vazias ganham altura pelo CSS (min-height), sem caracteres invisíveis
			// que iriam junto ao copiar o texto.
			return '<span class="cp-line' + ( marked[ number ] ? ' is-highlighted' : '' ) + '" data-ln="' + number + '">' + line + '</span>';
		} ).join( '' );
	}

	/** Quantidade de linhas do código (para a largura da coluna de números). */
	function countLines( code ) {
		return String( code || '' ).replace( /\r\n?/g, '\n' ).replace( /\n$/, '' ).split( '\n' ).length;
	}

	window.CodePress = {
		languages: LANGUAGES,
		render: render,
		highlight: highlight,
		parseRanges: parseRanges,
		countLines: countLines,
		escapeHtml: escapeHtml
	};
}( window ) );
