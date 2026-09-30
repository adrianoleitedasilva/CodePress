<?php
/**
 * Saída do bloco CodePress no site.
 *
 * O servidor gera o HTML completo com o código escapado (legível mesmo sem
 * JavaScript); o view.js aplica as cores, os números e os botões.
 *
 * @package codepress
 *
 * @var array    $attributes Atributos do bloco.
 * @var string   $content    Conteúdo interno (não usado).
 * @var WP_Block $block      Instância do bloco.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$cp_defaults  = codepress_settings();
$cp_languages = codepress_languages();
$cp           = wp_parse_args( array_filter( $attributes, 'is_scalar' ), $cp_defaults );
$cp_code      = (string) $cp['code'];

if ( '' === trim( $cp_code ) ) {
	return;
}

$cp_lang_key = isset( $cp_languages[ $cp['language'] ] ) ? $cp['language'] : 'plaintext';
$cp_lang     = $cp_languages[ $cp_lang_key ];
$cp_theme    = in_array( $cp['theme'], array( 'dark', 'light', 'auto' ), true ) ? $cp['theme'] : 'dark';
$cp_start    = max( 0, (int) $cp['startLine'] );
$cp_lines    = count( explode( "\n", rtrim( str_replace( array( "\r\n", "\r" ), "\n", $cp_code ), "\n" ) ) );

$cp_classes = array(
	'codepress',
	'codepress--' . $cp_theme,
	$cp['lineNumbers'] ? 'has-numbers' : '',
	$cp['wrap'] ? 'is-wrap' : '',
	$cp['showBorder'] ? 'has-border' : '',
	$cp['collapsible'] && $cp_lines > (int) $cp['collapsedLines'] ? 'is-collapsible' : '',
);

$cp_style = sprintf(
	'--cp-font-size:%1$dpx;--cp-line-height:%2$s;--cp-radius:%3$dpx;--cp-digits:%4$d;--cp-collapsed-lines:%5$d;',
	min( 22, max( 11, (int) $cp['fontSize'] ) ),
	(float) $cp['lineHeight'],
	min( 24, max( 0, (int) $cp['borderRadius'] ) ),
	strlen( (string) ( $cp_start + $cp_lines - 1 ) ),
	max( 3, (int) $cp['collapsedLines'] )
);

$cp_wrapper = get_block_wrapper_attributes(
	array(
		'class'               => implode( ' ', array_filter( $cp_classes ) ),
		'style'               => $cp_style,
		'data-language'       => $cp_lang_key,
		'data-start'          => $cp_start,
		'data-highlight'      => $cp['highlightLines'],
		'data-lines'          => $cp_lines,
		'data-collapsed-lines' => (int) $cp['collapsedLines'],
	)
);

$cp_icon_copy  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>';
$cp_icon_check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12l5 5L20 7"/></svg>';
$cp_icon_fold  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 15l5-5 5 5"/></svg>';

$cp_copy_button = $cp['showCopy'] ? sprintf(
	'<button type="button" class="codepress__btn codepress__copy" data-cp-copy><span class="codepress__copy-icon">%1$s</span><span class="codepress__copy-done">%2$s</span><span class="codepress__copy-label">%3$s</span></button>',
	$cp_icon_copy,
	$cp_icon_check,
	esc_html__( 'Copiar', 'codepress' )
) : '';

$cp_fold_button = in_array( 'is-collapsible', $cp_classes, true ) ? sprintf(
	'<button type="button" class="codepress__btn codepress__fold" data-cp-fold aria-expanded="false">%1$s<span class="codepress__fold-label">%2$s</span></button>',
	$cp_icon_fold,
	esc_html__( 'Expandir', 'codepress' )
) : '';
?>
<figure <?php echo $cp_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput -- gerado por get_block_wrapper_attributes(). ?>>
	<?php if ( $cp['showHeader'] ) : ?>
		<?php
		// Padrão único ("janela de editor"): bolinhas, aba e ações sempre no mesmo lugar.
		// A aba mostra o nome do arquivo; sem ele, o título; sem nenhum dos dois, a linguagem.
		$cp_tab      = $cp['filename'] ? $cp['filename'] : ( $cp['title'] ? $cp['title'] : $cp_lang['label'] );
		$cp_subtitle = $cp['filename'] && $cp['title'] ? $cp['title'] : '';
		?>
		<figcaption class="codepress__header">
			<span class="codepress__dots" aria-hidden="true"><i></i><i></i><i></i></span>
			<span class="codepress__tab">
				<?php if ( $cp['showIcon'] ) : ?>
					<?php echo codepress_icon(); // phpcs:ignore WordPress.Security.EscapeOutput -- SVG fixo. ?>
				<?php endif; ?>
				<span class="codepress__tab-name"><?php echo esc_html( $cp_tab ); ?></span>
			</span>
			<?php if ( $cp_subtitle ) : ?>
				<span class="codepress__subtitle"><?php echo esc_html( $cp_subtitle ); ?></span>
			<?php endif; ?>
			<span class="codepress__actions">
				<?php if ( $cp_tab !== $cp_lang['label'] ) : ?>
					<span class="codepress__lang"><?php echo esc_html( $cp_lang['label'] ); ?></span>
				<?php endif; ?>
				<?php echo $cp_fold_button . $cp_copy_button; // phpcs:ignore WordPress.Security.EscapeOutput -- HTML montado acima com esc_html. ?>
			</span>
		</figcaption>
	<?php endif; ?>

	<div class="codepress__body">
		<?php if ( ! $cp['showHeader'] && $cp_copy_button ) : ?>
			<span class="codepress__float"><?php echo $cp_copy_button; // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
		<?php endif; ?>
		<pre class="codepress__pre language-<?php echo esc_attr( $cp_lang['prism'] ? $cp_lang['prism'] : 'none' ); ?>" tabindex="0"><code><?php echo esc_html( $cp_code ); ?></code></pre>
	</div>

	<?php if ( $cp_fold_button ) : ?>
		<button type="button" class="codepress__more" data-cp-fold>
			<?php
			/* translators: %d: quantidade de linhas */
			echo esc_html( sprintf( __( 'Mostrar todo o código (%d linhas)', 'codepress' ), $cp_lines ) );
			?>
		</button>
	<?php endif; ?>
</figure>
