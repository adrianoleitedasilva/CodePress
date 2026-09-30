<?php
/**
 * Plugin Name:       CodePress
 * Plugin URI:        https://github.com/adrianoleitedasilva/CodePress
 * Description:       Blocos de código com aparência profissional para artigos: destaque de sintaxe (12 linguagens), temas escuro e claro no estilo do VS Code, números e destaque de linhas, cabeçalho com linguagem e nome do arquivo, botão Copiar e código recolhível.
 * Version:           1.1.1
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            Adriano Silva
 * Author URI:        https://adrianosilva.pro.br
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       codepress
 * Domain Path:       /languages
 *
 * @package codepress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CODEPRESS_VERSION', '1.1.1' );
define( 'CODEPRESS_DIR', plugin_dir_path( __FILE__ ) );
define( 'CODEPRESS_URL', plugin_dir_url( __FILE__ ) );

require CODEPRESS_DIR . 'includes/settings.php';

/**
 * Linguagens suportadas — fonte única para o PHP (cabeçalho do bloco) e o
 * JavaScript (editor e site), que recebe esta lista em window.codepressConfig.
 *
 * @return array chave => array( label, prism, icon, bg, fg ).
 */
function codepress_languages() {
	$languages = array(
		'javascript' => array( 'label' => 'JavaScript', 'prism' => 'javascript', 'icon' => 'JS', 'bg' => '#f7df1e', 'fg' => '#1e1e1e' ),
		'typescript' => array( 'label' => 'TypeScript', 'prism' => 'typescript', 'icon' => 'TS', 'bg' => '#3178c6', 'fg' => '#ffffff' ),
		'html'       => array( 'label' => 'HTML', 'prism' => 'markup', 'icon' => '<>', 'bg' => '#e34f26', 'fg' => '#ffffff' ),
		'css'        => array( 'label' => 'CSS', 'prism' => 'css', 'icon' => '#', 'bg' => '#663399', 'fg' => '#ffffff' ),
		'php'        => array( 'label' => 'PHP', 'prism' => 'php', 'icon' => 'php', 'bg' => '#777bb4', 'fg' => '#ffffff' ),
		'json'       => array( 'label' => 'JSON', 'prism' => 'json', 'icon' => '{}', 'bg' => '#f5a623', 'fg' => '#1e1e1e' ),
		'sql'        => array( 'label' => 'SQL', 'prism' => 'sql', 'icon' => 'SQL', 'bg' => '#e38c00', 'fg' => '#ffffff' ),
		'bash'       => array( 'label' => 'Bash', 'prism' => 'bash', 'icon' => '$_', 'bg' => '#2d3a3f', 'fg' => '#4eaa25' ),
		'python'     => array( 'label' => 'Python', 'prism' => 'python', 'icon' => 'Py', 'bg' => '#3776ab', 'fg' => '#ffd43b' ),
		'java'       => array( 'label' => 'Java', 'prism' => 'java', 'icon' => 'J', 'bg' => '#b07219', 'fg' => '#ffffff' ),
		'csharp'     => array( 'label' => 'C#', 'prism' => 'csharp', 'icon' => 'C#', 'bg' => '#68217a', 'fg' => '#ffffff' ),
		'c'          => array( 'label' => 'C', 'prism' => 'c', 'icon' => 'C', 'bg' => '#555ea8', 'fg' => '#ffffff' ),
		'cpp'        => array( 'label' => 'C++', 'prism' => 'cpp', 'icon' => 'C++', 'bg' => '#00599c', 'fg' => '#ffffff' ),
		'plaintext'  => array( 'label' => __( 'Texto', 'codepress' ), 'prism' => '', 'icon' => 'txt', 'bg' => '#6b7280', 'fg' => '#ffffff' ),
	);

	/**
	 * Permite ajustar rótulos, cores e ícones das linguagens.
	 *
	 * @param array $languages Linguagens.
	 */
	return apply_filters( 'codepress_languages', $languages );
}

/**
 * Ícone único do cabeçalho (o mesmo para todas as linguagens, na cor do tema da caixa).
 *
 * @return string SVG.
 */
function codepress_icon() {
	return '<svg class="codepress__glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/></svg>';
}

/**
 * Registra os scripts compartilhados e o bloco.
 */
function codepress_register() {
	wp_register_script( 'codepress-prism', CODEPRESS_URL . 'assets/prism/prism.js', array(), '1.30.0', true );
	wp_register_script( 'codepress-core', CODEPRESS_URL . 'assets/codepress-core.js', array( 'codepress-prism' ), CODEPRESS_VERSION, true );

	wp_add_inline_script(
		'codepress-core',
		'window.codepressConfig = ' . wp_json_encode(
			array(
				'languages' => codepress_languages(),
				'defaults'  => codepress_settings(),
				'icon'      => codepress_icon(),
				'i18n'      => array(
					'copy'     => __( 'Copiar', 'codepress' ),
					'copied'   => __( 'Copiado!', 'codepress' ),
					'expand'   => __( 'Expandir', 'codepress' ),
					'collapse' => __( 'Recolher', 'codepress' ),
					/* translators: %d: quantidade de linhas */
					'showAll'  => __( 'Mostrar todo o código (%d linhas)', 'codepress' ),
				),
			)
		) . ';',
		'before'
	);

	register_block_type( CODEPRESS_DIR . 'block' );
}
add_action( 'init', 'codepress_register' );

/**
 * Traduções do plugin.
 */
function codepress_load_textdomain() {
	load_plugin_textdomain( 'codepress', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'init', 'codepress_load_textdomain', 5 );

/**
 * Traduções do JavaScript do editor.
 */
function codepress_script_translations() {
	wp_set_script_translations( 'codepress-code-editor-script', 'codepress', CODEPRESS_DIR . 'languages' );
}
add_action( 'enqueue_block_editor_assets', 'codepress_script_translations' );

/**
 * Link "Configurações" na lista de plugins.
 *
 * @param array $links Links.
 * @return array
 */
function codepress_action_links( $links ) {
	array_unshift( $links, '<a href="' . esc_url( admin_url( 'admin.php?page=codepress' ) ) . '">' . esc_html__( 'Configurações', 'codepress' ) . '</a>' );
	return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'codepress_action_links' );
