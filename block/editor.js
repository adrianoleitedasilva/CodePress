/**
 * CodePress — bloco no editor (Gutenberg). Escrito sem etapa de build: usa as
 * bibliotecas globais do WordPress (wp.blocks, wp.element, wp.components…).
 *
 * Edição com destaque ao vivo: um <textarea> transparente fica exatamente por
 * cima do código colorido (mesma fonte, tamanho e espaçamento); você digita no
 * textarea e vê as cores do <pre> embaixo, como numa IDE.
 */
( function ( wp ) {
	'use strict';

	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useMemo = wp.element.useMemo;
	var useRef = wp.element.useRef;
	var __ = wp.i18n.__;
	var sprintf = wp.i18n.sprintf;
	var be = wp.blockEditor;
	var c = wp.components;

	var config = window.codepressConfig || {};
	var defaults = config.defaults || {};
	var languages = config.languages || {};
	var INDENT = '  ';

	// Valor efetivo: o do bloco, ou o padrão do menu CodePress.
	function pick( attributes, key ) {
		return attributes[ key ] === undefined || attributes[ key ] === null ? defaults[ key ] : attributes[ key ];
	}

	// Conteúdo de um bloco "Código" do WordPress (HTML) -> texto puro.
	function htmlToText( html ) {
		var doc = new window.DOMParser().parseFromString( '<pre>' + String( html || '' ).replace( /<br\s*\/?>/gi, '\n' ) + '</pre>', 'text/html' );
		return doc.body.textContent || '';
	}

	/* ------------------------------------------------------------------ */
	/* Barra lateral                                                       */
	/* ------------------------------------------------------------------ */

	function Sidebar( props ) {
		var a = props.attributes;
		var set = props.setAttributes;
		var languageOptions = Object.keys( languages ).map( function ( key ) {
			return { value: key, label: languages[ key ].label };
		} );
		var inherit = function ( key ) {
			return a[ key ] === undefined ? ' ' + __( '(padrão do site)', 'codepress' ) : '';
		};
		var resetButton = function ( keys ) {
			var custom = keys.some( function ( k ) {
				return a[ k ] !== undefined;
			} );
			if ( ! custom ) {
				return null;
			}
			var reset = {};
			keys.forEach( function ( k ) {
				reset[ k ] = undefined;
			} );
			return el( c.Button, { variant: 'link', isDestructive: true, onClick: function () { set( reset ); } }, __( 'Voltar ao padrão do site', 'codepress' ) );
		};

		return el(
			be.InspectorControls,
			null,
			el(
				c.PanelBody,
				{ title: __( 'Código', 'codepress' ), initialOpen: true },
				el( c.SelectControl, { label: __( 'Linguagem', 'codepress' ), value: a.language, options: languageOptions, onChange: function ( v ) { set( { language: v } ); }, __nextHasNoMarginBottom: true } ),
				el( 'br' ),
				el( c.TextControl, { label: __( 'Nome do arquivo', 'codepress' ), value: a.filename, placeholder: 'user.js', onChange: function ( v ) { set( { filename: v } ); }, __nextHasNoMarginBottom: true } ),
				el( 'br' ),
				el( c.TextControl, { label: __( 'Título personalizado', 'codepress' ), value: a.title, placeholder: __( 'Ex.: Buscando o usuário', 'codepress' ), onChange: function ( v ) { set( { title: v } ); }, __nextHasNoMarginBottom: true } )
			),
			el(
				c.PanelBody,
				{ title: __( 'Cabeçalho', 'codepress' ), initialOpen: false },
				el( c.ToggleControl, { label: __( 'Mostrar cabeçalho', 'codepress' ), checked: a.showHeader, onChange: function ( v ) { set( { showHeader: v } ); }, __nextHasNoMarginBottom: true } ),
				el( c.ToggleControl, { label: __( 'Mostrar ícone da linguagem', 'codepress' ), checked: a.showIcon, disabled: ! a.showHeader, onChange: function ( v ) { set( { showIcon: v } ); }, __nextHasNoMarginBottom: true } ),
				el( c.ToggleControl, { label: __( 'Mostrar botão Copiar', 'codepress' ), checked: a.showCopy, onChange: function ( v ) { set( { showCopy: v } ); }, __nextHasNoMarginBottom: true } )
			),
			el(
				c.PanelBody,
				{ title: __( 'Linhas', 'codepress' ), initialOpen: false },
				el( c.ToggleControl, { label: __( 'Números das linhas', 'codepress' ) + inherit( 'lineNumbers' ), checked: !! pick( a, 'lineNumbers' ), onChange: function ( v ) { set( { lineNumbers: v } ); }, __nextHasNoMarginBottom: true } ),
				el( c.ToggleControl, { label: __( 'Quebrar linhas longas', 'codepress' ) + inherit( 'wrap' ), help: __( 'Desligado: linhas longas rolam para o lado.', 'codepress' ), checked: !! pick( a, 'wrap' ), onChange: function ( v ) { set( { wrap: v } ); }, __nextHasNoMarginBottom: true } ),
				el( c.TextControl, { type: 'number', min: 0, label: __( 'Número da primeira linha', 'codepress' ), value: a.startLine, onChange: function ( v ) { set( { startLine: Math.max( 0, parseInt( v, 10 ) || 0 ) } ); }, __nextHasNoMarginBottom: true } ),
				el( 'br' ),
				el( c.TextControl, { label: __( 'Destacar linhas', 'codepress' ), help: __( 'Ex.: 2, 5-7 (use a numeração exibida).', 'codepress' ), value: a.highlightLines, onChange: function ( v ) { set( { highlightLines: v } ); }, __nextHasNoMarginBottom: true } ),
				resetButton( [ 'lineNumbers', 'wrap' ] )
			),
			el(
				c.PanelBody,
				{ title: __( 'Aparência', 'codepress' ), initialOpen: false },
				el( c.SelectControl, {
					label: __( 'Tema', 'codepress' ) + inherit( 'theme' ),
					value: pick( a, 'theme' ),
					options: [
						{ value: 'dark', label: __( 'Escuro (VS Code Dark+)', 'codepress' ) },
						{ value: 'light', label: __( 'Claro (VS Code Light+)', 'codepress' ) },
						{ value: 'auto', label: __( 'Automático (claro/escuro do site)', 'codepress' ) }
					],
					onChange: function ( v ) { set( { theme: v } ); },
					__nextHasNoMarginBottom: true
				} ),
				el( 'br' ),
				el( c.RangeControl, { label: __( 'Tamanho da fonte (px)', 'codepress' ) + inherit( 'fontSize' ), min: 11, max: 22, value: pick( a, 'fontSize' ), onChange: function ( v ) { set( { fontSize: v } ); }, __nextHasNoMarginBottom: true } ),
				el( c.RangeControl, { label: __( 'Espaçamento entre linhas', 'codepress' ) + inherit( 'lineHeight' ), min: 1.2, max: 2.2, step: 0.1, value: pick( a, 'lineHeight' ), onChange: function ( v ) { set( { lineHeight: v } ); }, __nextHasNoMarginBottom: true } ),
				el( c.RangeControl, { label: __( 'Arredondamento (px)', 'codepress' ) + inherit( 'borderRadius' ), min: 0, max: 24, value: pick( a, 'borderRadius' ), onChange: function ( v ) { set( { borderRadius: v } ); }, __nextHasNoMarginBottom: true } ),
				el( c.ToggleControl, { label: __( 'Borda', 'codepress' ) + inherit( 'showBorder' ), checked: !! pick( a, 'showBorder' ), onChange: function ( v ) { set( { showBorder: v } ); }, __nextHasNoMarginBottom: true } ),
				resetButton( [ 'theme', 'fontSize', 'lineHeight', 'borderRadius', 'showBorder' ] )
			),
			el(
				c.PanelBody,
				{ title: __( 'Recolher código longo', 'codepress' ), initialOpen: false },
				el( c.ToggleControl, { label: __( 'Mostrar recolhido no site', 'codepress' ), help: __( 'O visitante vê as primeiras linhas e um botão para expandir.', 'codepress' ), checked: a.collapsible, onChange: function ( v ) { set( { collapsible: v } ); }, __nextHasNoMarginBottom: true } ),
				a.collapsible && el( c.RangeControl, { label: __( 'Linhas visíveis quando recolhido', 'codepress' ), min: 3, max: 60, value: a.collapsedLines, onChange: function ( v ) { set( { collapsedLines: v } ); }, __nextHasNoMarginBottom: true } )
			)
		);
	}

	/* ------------------------------------------------------------------ */
	/* Bloco no editor                                                     */
	/* ------------------------------------------------------------------ */

	function Edit( props ) {
		var a = props.attributes;
		var set = props.setAttributes;
		var input = useRef( null );
		var escaped = useRef( false );
		var lang = languages[ a.language ] || languages.plaintext || { label: a.language, icon: '', bg: '#666', fg: '#fff' };
		var theme = pick( a, 'theme' );
		var numbers = !! pick( a, 'lineNumbers' );
		var wrap = !! pick( a, 'wrap' );
		var lines = window.CodePress.countLines( a.code );
		var digits = String( ( a.startLine || 0 ) + lines - 1 ).length;

		var html = useMemo(
			function () {
				// Uma quebra de linha extra no fim mantém a última linha vazia visível enquanto se digita.
				return window.CodePress.render( a.code + ( /\n$/.test( a.code ) ? ' ' : '' ), { language: a.language, start: a.startLine, highlight: a.highlightLines } );
			},
			[ a.code, a.language, a.startLine, a.highlightLines ]
		);

		var blockProps = be.useBlockProps( {
			className: [
				'codepress',
				'codepress--' + theme,
				'is-ready',
				'is-editing',
				numbers ? 'has-numbers' : '',
				wrap ? 'is-wrap' : '',
				pick( a, 'showBorder' ) ? 'has-border' : ''
			].filter( Boolean ).join( ' ' ),
			style: {
				'--cp-font-size': pick( a, 'fontSize' ) + 'px',
				'--cp-line-height': pick( a, 'lineHeight' ),
				'--cp-radius': pick( a, 'borderRadius' ) + 'px',
				'--cp-digits': digits
			}
		} );

		// Tab indenta (Shift+Tab desindenta). Depois de Esc, o próximo Tab sai do campo (acessibilidade).
		function onKeyDown( event ) {
			var field = event.target;
			if ( event.key === 'Escape' ) {
				escaped.current = true;
				return;
			}
			if ( event.key !== 'Tab' || escaped.current ) {
				escaped.current = false;
				return;
			}
			event.preventDefault();
			var value = field.value;
			var start = field.selectionStart;
			var end = field.selectionEnd;
			var lineStart = value.lastIndexOf( '\n', start - 1 ) + 1;
			var next;
			var cursorStart;
			var cursorEnd;

			if ( start === end && ! event.shiftKey ) {
				next = value.slice( 0, start ) + INDENT + value.slice( end );
				cursorStart = cursorEnd = start + INDENT.length;
			} else {
				// Várias linhas selecionadas (ou Shift+Tab): indenta/desindenta cada linha.
				var oldLines = value.slice( lineStart, end ).split( '\n' );
				var newLines = oldLines.map( function ( line ) {
					if ( event.shiftKey ) {
						return line.replace( new RegExp( '^( {1,' + INDENT.length + '}|\\t)' ), '' );
					}
					return INDENT + line;
				} );
				var firstDelta = newLines[ 0 ].length - oldLines[ 0 ].length; // quanto a 1ª linha mudou
				var totalDelta = newLines.join( '\n' ).length - oldLines.join( '\n' ).length;
				next = value.slice( 0, lineStart ) + newLines.join( '\n' ) + value.slice( end );
				cursorStart = Math.max( lineStart, start + firstDelta );
				cursorEnd = Math.max( cursorStart, end + totalDelta );
			}
			set( { code: next } );
			window.requestAnimationFrame( function () {
				if ( input.current ) {
					input.current.selectionStart = cursorStart;
					input.current.selectionEnd = cursorEnd;
				}
			} );
		}

		// Padrão único ("janela de editor"), igual ao render.php: bolinhas, aba e ações.
		var tab = a.filename || a.title || lang.label;
		var header = a.showHeader && el(
			'div',
			{ className: 'codepress__header' },
			el( 'span', { className: 'codepress__dots', 'aria-hidden': true }, el( 'i' ), el( 'i' ), el( 'i' ) ),
			el(
				'span',
				{ className: 'codepress__tab' },
				a.showIcon && el( 'span', { className: 'codepress__glyph-wrap', dangerouslySetInnerHTML: { __html: config.icon || '' } } ),
				el( 'span', { className: 'codepress__tab-name' }, tab )
			),
			a.filename && a.title && el( 'span', { className: 'codepress__subtitle' }, a.title ),
			el(
				'span',
				{ className: 'codepress__actions' },
				tab !== lang.label && el( 'span', { className: 'codepress__lang' }, lang.label ),
				a.collapsible && el( 'span', { className: 'codepress__btn is-static' }, sprintf( __( 'Recolhido em %d linhas', 'codepress' ), a.collapsedLines ) ),
				a.showCopy && el( 'span', { className: 'codepress__btn is-static' }, __( 'Copiar', 'codepress' ) )
			)
		);

		return el(
			Fragment,
			null,
			el( Sidebar, props ),
			el(
				be.BlockControls,
				{ group: 'block' },
				el( c.ToolbarDropdownMenu, {
					icon: 'editor-code',
					label: __( 'Linguagem', 'codepress' ),
					text: lang.label,
					controls: Object.keys( languages ).map( function ( key ) {
						return { title: languages[ key ].label, isActive: key === a.language, onClick: function () { set( { language: key } ); } };
					} )
				} )
			),
			el(
				'figure',
				blockProps,
				header,
				el(
					'div',
					{ className: 'codepress__body' },
					el(
						'div',
						{ className: 'cp-edit' },
						el( 'pre', { className: 'codepress__pre', 'aria-hidden': true }, el( 'code', { dangerouslySetInnerHTML: { __html: html } } ) ),
						el( 'textarea', {
							ref: input,
							className: 'cp-input',
							value: a.code,
							spellCheck: false,
							autoCapitalize: 'off',
							autoComplete: 'off',
							autoCorrect: 'off',
							wrap: wrap ? 'soft' : 'off',
							placeholder: __( 'Cole ou digite o código aqui…', 'codepress' ),
							'aria-label': sprintf( __( 'Código (%s)', 'codepress' ), lang.label ),
							onChange: function ( event ) { set( { code: event.target.value } ); },
							onKeyDown: onKeyDown
						} )
					)
				)
			)
		);
	}

	wp.blocks.registerBlockType( 'codepress/code', {
		edit: Edit,
		save: function () {
			return null; // Bloco dinâmico: o HTML é gerado pelo render.php.
		},
		transforms: {
			from: [
				{
					type: 'block',
					blocks: [ 'core/code', 'core/preformatted' ],
					transform: function ( attrs ) {
						return wp.blocks.createBlock( 'codepress/code', { code: htmlToText( attrs.content ) } );
					}
				}
			],
			to: [
				{
					type: 'block',
					blocks: [ 'core/code' ],
					transform: function ( attrs ) {
						return wp.blocks.createBlock( 'core/code', { content: window.CodePress.escapeHtml( attrs.code ) } );
					}
				}
			]
		}
	} );
}( window.wp ) );
