<?php
/**
 * Menu CodePress (painel): valores padrão de todos os blocos de código.
 * Cada bloco pode sobrescrever qualquer um deles na barra lateral do editor.
 *
 * @package codepress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Valores padrão de fábrica.
 *
 * @return array
 */
function codepress_defaults() {
	return array(
		'theme'        => 'dark',
		'lineNumbers'  => true,
		'wrap'         => false,
		'fontSize'     => 14,
		'lineHeight'   => 1.6,
		'borderRadius' => 10,
		'showBorder'   => true,
	);
}

/**
 * Configurações salvas, completadas com os padrões.
 *
 * @return array
 */
function codepress_settings() {
	$saved = get_option( 'codepress_settings', array() );
	return array_merge( codepress_defaults(), is_array( $saved ) ? $saved : array() );
}

/**
 * Valida as configurações.
 *
 * @param array $input Dados enviados.
 * @return array
 */
function codepress_sanitize_settings( $input ) {
	$input = is_array( $input ) ? $input : array();
	return array(
		'theme'        => isset( $input['theme'] ) && in_array( $input['theme'], array( 'dark', 'light', 'auto' ), true ) ? $input['theme'] : 'dark',
		'lineNumbers'  => ! empty( $input['lineNumbers'] ),
		'wrap'         => ! empty( $input['wrap'] ),
		'fontSize'     => isset( $input['fontSize'] ) ? min( 22, max( 11, (int) $input['fontSize'] ) ) : 14,
		'lineHeight'   => isset( $input['lineHeight'] ) ? min( 2.2, max( 1.2, round( (float) $input['lineHeight'], 1 ) ) ) : 1.6,
		'borderRadius' => isset( $input['borderRadius'] ) ? min( 24, max( 0, (int) $input['borderRadius'] ) ) : 10,
		'showBorder'   => ! empty( $input['showBorder'] ),
	);
}

/**
 * Registra a opção e a página.
 */
function codepress_settings_init() {
	register_setting(
		'codepress',
		'codepress_settings',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'codepress_sanitize_settings',
			'default'           => codepress_defaults(),
		)
	);
}
add_action( 'admin_init', 'codepress_settings_init' );

/**
 * Menu próprio "CodePress" na barra lateral do painel, logo acima de Aparência
 * (Aparência fica na posição 60; o tema Root WP, na 59.6).
 */
function codepress_settings_menu() {
	add_menu_page(
		__( 'CodePress', 'codepress' ),
		__( 'CodePress', 'codepress' ),
		'manage_options',
		'codepress',
		'codepress_settings_page',
		'dashicons-editor-code',
		'59.5'
	);
}

/**
 * Tira o separador que o WordPress coloca na posição 59 (entre Comentários e
 * Aparência), para o CodePress ficar em sequência com Aparência.
 */
function codepress_remove_menu_separator() {
	global $menu;
	if ( isset( $menu[59] ) && isset( $menu[59][4] ) && false !== strpos( $menu[59][4], 'wp-menu-separator' ) ) {
		unset( $menu[59] );
	}
}
add_action( 'admin_menu', 'codepress_remove_menu_separator', 999 );
add_action( 'admin_menu', 'codepress_settings_menu' );

/**
 * Tela de configurações.
 */
function codepress_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$s    = codepress_settings();
	$name = function ( $key ) {
		return 'codepress_settings[' . $key . ']';
	};
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'CodePress', 'codepress' ); ?></h1>
		<p><?php esc_html_e( 'Aparência padrão dos blocos de código. Cada bloco pode mudar estes valores na barra lateral do editor; os blocos que não mudarem acompanham o que for definido aqui.', 'codepress' ); ?></p>

		<form method="post" action="options.php">
			<?php settings_fields( 'codepress' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="cp-theme"><?php esc_html_e( 'Tema', 'codepress' ); ?></label></th>
					<td>
						<select id="cp-theme" name="<?php echo esc_attr( $name( 'theme' ) ); ?>">
							<option value="dark" <?php selected( $s['theme'], 'dark' ); ?>><?php esc_html_e( 'Escuro (estilo VS Code Dark+)', 'codepress' ); ?></option>
							<option value="light" <?php selected( $s['theme'], 'light' ); ?>><?php esc_html_e( 'Claro (estilo VS Code Light+)', 'codepress' ); ?></option>
							<option value="auto" <?php selected( $s['theme'], 'auto' ); ?>><?php esc_html_e( 'Automático (acompanha o modo claro/escuro do site ou do sistema)', 'codepress' ); ?></option>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="cp-font-size"><?php esc_html_e( 'Tamanho da fonte', 'codepress' ); ?></label></th>
					<td><input type="number" id="cp-font-size" class="small-text" min="11" max="22" name="<?php echo esc_attr( $name( 'fontSize' ) ); ?>" value="<?php echo esc_attr( $s['fontSize'] ); ?>"> px</td>
				</tr>
				<tr>
					<th scope="row"><label for="cp-line-height"><?php esc_html_e( 'Espaçamento entre linhas', 'codepress' ); ?></label></th>
					<td><input type="number" id="cp-line-height" class="small-text" min="1.2" max="2.2" step="0.1" name="<?php echo esc_attr( $name( 'lineHeight' ) ); ?>" value="<?php echo esc_attr( $s['lineHeight'] ); ?>"></td>
				</tr>
				<tr>
					<th scope="row"><label for="cp-radius"><?php esc_html_e( 'Arredondamento dos cantos', 'codepress' ); ?></label></th>
					<td><input type="number" id="cp-radius" class="small-text" min="0" max="24" name="<?php echo esc_attr( $name( 'borderRadius' ) ); ?>" value="<?php echo esc_attr( $s['borderRadius'] ); ?>"> px</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Exibição', 'codepress' ); ?></th>
					<td>
						<?php
						$checks = array(
							'lineNumbers' => __( 'Mostrar o número das linhas', 'codepress' ),
							'wrap'        => __( 'Quebrar linhas longas (em vez de rolar para o lado)', 'codepress' ),
							'showBorder'  => __( 'Mostrar borda em volta do bloco', 'codepress' ),
						);
						foreach ( $checks as $key => $label ) :
							?>
							<p><label><input type="checkbox" name="<?php echo esc_attr( $name( $key ) ); ?>" value="1" <?php checked( $s[ $key ] ); ?>> <?php echo esc_html( $label ); ?></label></p>
						<?php endforeach; ?>
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}
